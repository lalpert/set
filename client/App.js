/**
 * Created by russell on 3/7/16.
 */

'use strict';
import React, {
  Component,
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  Websocket,
  Navigator,
} from 'react-native';
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import SetContainer from './SetContainer'
import IntroContainer from './IntroContainer'
import Storage from './Storage'

// EVENTS:
// Incoming:
// setClaimed [player, claimedset, newcards]
// gameState: {cards: "", players: ""}
// gameOver
// [eventually] add player, player score change, etc.

// Outgoing:
// joinGame
// claimSet

// {type: "SET_CLAIMED", claimedSet: [{id: 0}, {id: 10}, {id: 5}], newCards: [{id: 3, color: .., shape: ..., number: 2, fill: ...}]}
// {type: "SET_BOARD", board: [{id: .., }], players: [{id: ..., score: ...}]}
// {type: "PLAYER_JOINED"}

const defaultState = {board: [], selected: [], players: [], player: {name: ""}};
const reduce = (state, action) => {
  switch (action.type) {
    // SERVER ACTIONS
    case "INIT":
      return Object.assign({}, state, defaultState);

    case "CLEAR":
      return Object.assign({}, defaultState, {player: {name: state.player.name}});

    case "ADD_WS":
      return Object.assign({}, state, {ws: action.ws});

    case "JOIN_ACCEPTED":
      return Object.assign({}, state, {player: Object.assign({}, state.player, {id: action.id, secret: action.secret})});

    case "SET_BOARD":
      if (action.seq <= state.seq) {
        console.warn("Received out of sequence message");
        return state;
      }
      const filteredSelected = state.selected.filter(id => {
        return action.board.find(card => card.id == id) != undefined
      });
      return Object.assign({}, state, {
        board: action.board,
        selected: filteredSelected,
        players: action.players,
        claimed: undefined,
        invalid: undefined,
        seq: action.seq
      });

    case "SET_NAME":
      return Object.assign({}, state, {player: Object.assign({}, state.player, {name: action.name})});

    case "SET_SECRET":
      return Object.assign({}, state, {player: Object.assign({}, state.player, {id: action.id, secret: action.secret})});

    // SUBACTIONS
    case "SET_CLAIMED":
      // playerId, cardIds
      return Object.assign({}, state, {
        claimed: {
          cards: action.cardIds,
          claimer: action.playerId,
          onComplete: action.onComplete
        }
      });

    case "SET_INVALID":
      const onComplete = () => {
        action.onComplete();
        action.dispatch({type: "CLEAR_SELECTION"});
      };
      return Object.assign({}, state, {
        invalid: {
          cards: action.cardIds,
          onComplete
        }
      });


    // LOCAL ACTIONS
    case "CARD_SELECTED":
      return Object.assign({}, state, {selected: [...state.selected, action.cardId]});
    case "CARD_DESELECTED":
      const selectedCards = state.selected.filter(id => id != action.cardId);
      return Object.assign({}, state, {selected: selectedCards});

    case "CLEAR_SELECTION":
      return Object.assign({}, state, {selected: []});

    case "CLAIM_SET":
      return state;

    default:
      return state;
  }
};

const processAction = (dispatch, gameAction, onComplete) => {
  if (gameAction) {
    const completable = Object.assign({}, gameAction, {onComplete}, {dispatch});
    console.log("dispatching: ", completable);
    dispatch(completable);
  } else {
    onComplete();
  }
};

const handleSideEffects = (message) => {
  if (message.type == "JOIN_ACCEPTED") {
    Storage.setConfig(message.id, message.secret);
  }
};

const processMessage = (message) => {
  handleSideEffects(message);
  const mainDispatch = dispatch => {
    const messageWithoutAction = Object.assign({}, message, {action: undefined});
    messageWithoutAction.action = undefined;
    dispatch(messageWithoutAction);
  };

  return dispatch => {
    const onComplete = () => mainDispatch(dispatch);
    processAction(dispatch, message.action, onComplete);
  }
};

const loadFromStorage = async (dispatch) => {
  const playerName = await Storage.getName();
  const config = await Storage.getConfig();
  if (playerName) {
    dispatch({type: "SET_NAME", name: playerName});
  }
  if (config) {
    dispatch({type: "SET_SECRET", id: config.id, secret: config.secret});
  }
};

const store = createStore(reduce, applyMiddleware(thunk));

store.dispatch({type: "INIT"});

const localhostAddress = 'ws://localhost:8080/ws';
const prodServerAddress = 'ws://45.55.20.132/ws';
const Server = (store) => {
  var reconnectDelay = 10;
  const MaxReconnectDelay = 5000;
  const queue = [];
  const connect = () => {
    const ws = new WebSocket(prodServerAddress);
    ws.onopen = () => {
      store.dispatch({type: "ADD_WS", ws: ws});
      const player = store.getState().player;
      console.log("name", player.name);
      if (player.id) {
        send({type: "REJOIN_GAME", id: player.id, secret: player.secret});
      } else {
        send({type: "JOIN_GAME", name: player.name});
      }
      const queueCopy = queue.slice();
      queue.length = 0;
      queueCopy.forEach(send);
      reconnectDelay = 10;
    };

    ws.onmessage = (msg) => {
      const message = JSON.parse(msg.data);
      console.log(msg.data);
      if (!message.type) {
        console.warn("No type defined! Msg:", msg.data);
      } else if (message.type == "ERROR") {
        store.dispatch({type: "CLEAR"});
        Storage.clearConfig().then(() => {
            loadFromStorage(store.dispatch)
        }).then(() => connect());
      } else {
        store.dispatch(processMessage(message));
      }
    };

    ws.onerror = (err) => {
      console.warn("connection error: ", err.message);
      setTimeout(connect, reconnectDelay);
      reconnectDelay *= 2;
      reconnectDelay = Math.min(reconnectDelay, MaxReconnectDelay);
    };

    ws.onclose = (err) => {
      console.warn("connection closed: ", err.code, err.reason);
      setTimeout(connect, reconnectDelay);
      reconnectDelay *= 2;
      reconnectDelay = Math.min(reconnectDelay, MaxReconnectDelay);
    }
  };

  const send = (msg) => {
    try {
      store.getState().ws.send(JSON.stringify(msg));
      return true;
    } catch (e) {
      queue.push(msg);
      return false;
    }
  };

  return {send, connect};
};


const server = Server(store);

loadFromStorage(store.dispatch).then(() => server.connect());

export default React.createClass({
  renderScene(route, nav) {
    if (route == undefined) {
      return <View><Text>Undefined</Text></View>
    }
    switch(route.id) {
      case 'intro':
        return <IntroContainer gotoMultiplayerGlobal={() => nav.push({id: 'multi'})}/>;
      case 'multi':
        return <SetContainer server={server}/>;
      default:
        return <View><Text>Default</Text></View>;
    }

  },

  render() {
    return <Provider store={store}>
      <Navigator
        renderScene={this.renderScene}
        initialRoute={{id: 'intro'}}
      />
    </Provider>
  }
});
