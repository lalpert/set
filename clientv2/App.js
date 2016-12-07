/**
 * Created by russell on 3/7/16.
 */

'use strict';
import React, { Component } from 'react';
import { 
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
import RemoteServer from './RemoteServer'
import LocalServer from './LocalServer'
import ServerCanary from './ServerCanary'

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
  console.log("processing at reducer root: ", action);
  switch (action.type) {
    // SERVER ACTIONS
    case "INIT":
      return Object.assign({}, state, defaultState);

    case "CLEAR":
      return Object.assign({}, defaultState, {player: {name: state.player.name}});

    case "ADD_WS":
      return Object.assign({}, state, {ws: action.ws});

    case "JOIN_ACCEPTED":
      return Object.assign({}, state, {
        player: Object.assign({}, state.player, {
          id: action.id,
          secret: action.secret
        })
      });

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
      return Object.assign({}, state, {
        player: Object.assign({}, state.player, {
          id: action.id,
          secret: action.secret
        })
      });

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

    case "GAME_OVER":
      // TODO: actually handle this action and call onComplete when the animation is over
      action.onComplete();
      return state;

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

    case "CONNECTION_STATUS":
      return Object.assign({}, state, {connected: action.connected});

    default:
      return state;
  }
};

const processAction = (dispatch, gameAction, onComplete) => {
  console.log("processing action", gameAction, onComplete);
  if (gameAction) {
    const completable = Object.assign({}, gameAction, {onComplete}, {dispatch});
    console.log("dispatching action:: ", completable);
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
  console.log("Processing message: ", message);
  handleSideEffects(message);
  console.log("handled side effects");
  const mainDispatch = dispatch => {
    console.log("main dispatch")
    const messageWithoutAction = Object.assign({}, message, {action: undefined});
    messageWithoutAction.action = undefined;
    dispatch(messageWithoutAction);
  };

  return dispatch => {
    const onComplete = () => mainDispatch(dispatch);
    console.log("procing");
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

const localhostAddress = 'localhost:8080';
const prodServerAddress = '45.55.20.132:443';

const wsAddress = `ws://${prodServerAddress}/ws`;
const canaryAddress = `http://${prodServerAddress}/status`;

loadFromStorage(store.dispatch);

const canary = ServerCanary(store.dispatch, canaryAddress);
canary.checkConnectivity();
setInterval(canary.checkConnectivity, 5000);

export default React.createClass({
  connectToRemoteServer(nav) {
    const server = RemoteServer(wsAddress, store, loadFromStorage, processMessage);
    setTimeout(server.connect, 0);
    this.setState({server});
    nav.push({id: 'multi'});
  },

  connectLocal(nav) {
    const server = LocalServer(msg => store.dispatch(processMessage(msg)));
    this.setState({server});
    nav.push({id: 'single'});
  },

  renderScene(route, nav) {
    if (route == undefined) {
      return <View><Text>Undefined</Text></View>
    }
    switch (route.id) {
      case 'intro':
        return <IntroContainer
          gotoMultiplayerGlobal={() => this.connectToRemoteServer(nav)}
          gotoSinglePlayer={() => this.connectLocal(nav)}
        />;
      case 'multi':
        return <SetContainer server={this.state.server}/>;
      case 'single':
        return <SetContainer server={this.state.server}/>;
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
