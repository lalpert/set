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
  Websocket
} from 'react-native';
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import SetContainer from './SetContainer'

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

const defaultState = {board: [], selected: [], players: []};
const reduce = (state, action) => {
  switch (action.type) {
    // SERVER ACTIONS
    case "INIT":
      return Object.assign({}, state, defaultState);

    case "CLEAR":
      return Object.assign({}, defaultState);

    case "ADD_WS":
      return Object.assign({}, state, {ws: action.ws});

    case "JOIN_ACCEPTED":
      return Object.assign({}, state, {player: {id: action.id, secret: action.secret}});

    case "SET_BOARD":
      const filteredSelected = state.selected.filter(id => {
        return action.board.find(card => card.id == id) != undefined
      });
      return Object.assign({}, state, {board: action.board, selected: filteredSelected, players: action.players, claimed: undefined});


    // SUBACTIONS
    case "SET_CLAIMED":
      // playerId, cardIds
      return Object.assign({}, state, {claimed: {cards: action.cardIds, claimer: action.playerId, onComplete: action.onComplete}});

    case "SET_INVALID":




    // LOCAL ACTIONS
    case "CARD_SELECTED":
      return Object.assign({}, state, {selected: [...state.selected, action.cardId]});
    case "CARD_DESELECTED":
      const selectedCards = state.selected.filter(id => id != action.cardId);
      return Object.assign({}, state, {selected: selectedCards});

    case "CLAIM_SET":
      return state;

    default:
      return state;
  }
};

const processAction = (dispatch, gameAction, onComplete) => {
  if (gameAction) {
    const completable = Object.assign({}, gameAction, {onComplete});
    console.warn("dispatching: ", completable);
    dispatch(completable);
  } else {
    onComplete();
  }
};

const processMessage = (message) => {
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

const store = createStore(reduce, applyMiddleware(thunk));

store.dispatch({type: "INIT"});
const serverAddress = 'ws://localhost:8080/ws';
const Server = (store) => {
  var reconnectDelay = 10;
  const MaxReconnectDelay = 5000;
  const queue = [];
  const connect = () => {
    const ws = new WebSocket(serverAddress);
    ws.onopen = () => {
      store.dispatch({type: "ADD_WS", ws: ws});
      const player = store.getState().player;
      if (player) {
        console.warn("app", player, player.id, player.secret);
        send({type: "REJOIN_GAME", id: player.id, secret: player.secret});
      } else {
        send({type: "JOIN_GAME"});
      }
      const queueCopy = queue.slice();
      queue.length = 0;
      queueCopy.forEach(send);
      reconnectDelay = 10;
    };

    ws.onmessage = (msg) => {
      const message = JSON.parse(msg.data);
      console.warn(msg.data);
      if (!message.type) {
        console.warn("No type defined! Msg:", msg.data);
      } else if (message.type == "ERROR") {
        store.dispatch({type: "CLEAR"});
        connect();
      } else {
        store.dispatch(processMessage(message));
      }
    };

    ws.onerror = (err) => {
      console.warn("connection error: ", err.message);
      setTimeout(connect, reconnectDelay);
      reconnectDelay *= 2;
    };

    ws.onclose = (err) => {
      console.warn("connection closed: ", err.code, err.reason);
      setTimeout(connect, reconnectDelay);
      reconnectDelay *= 2;
      reconnectDelay = math.min(reconnectDelay, MaxReconnectDelay);
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
  connect();

  return {send};
};

const server = Server(store);

export default class extends Component {
  render() {
    return <Provider store={store}><SetContainer server={server}/></Provider>
  }
}
