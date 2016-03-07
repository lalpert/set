/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  Websocket
} from 'react-native';
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux';
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
// {type: "SET_BOARD", board: [{id: .., }], scores: ...}
// {type: "PLAYER_JOINED"}

const defaultState = {board: [], selected: []};
const reduce = (state, action) => {
  switch (action.type) {
    // SERVER ACTIONS
    case "INIT":
      return Object.assign({}, state, defaultState);
    case "ADD_WS":
      return Object.assign({}, state, {ws: action.ws});

    case "SET_BOARD":
      const filteredSelected = state.selected.filter(id => {
        return action.board.find(card => card.id == id) != undefined
      });
      return Object.assign({}, state, {board: action.board, selected: filteredSelected});
    case "SET_CLAIMED":
      const remainingCards = state.board.filter(card => {
        return action.claimedSet.find(claimedCard => claimedCard.id == card.id) === undefined;
      });
      const newBoard = [...remainingCards, ...action.newCards];
      return Object.assign({}, state, {board: newBoard});

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

const store = createStore(reduce);

store.dispatch({type: "INIT"});




const Server = (store) => {
  var reconnectDelay = 10;
  const queue = [];
  const connect = () => {
    const ws = new WebSocket('ws://localhost:8080/ws');
    ws.onopen = () => {
      store.dispatch({type: "ADD_WS", ws: ws});
      send({type: "JOIN_GAME"});
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
      } else {
        store.dispatch(message);
      }
    };

    ws.onerror = (err) => {
      console.warn(err.reason);
      setTimeout(connect, reconnectDelay);
      reconnectDelay *= 2;
    };

    ws.onclose = (err) => {
      console.warn(e.code, e.reason);
      setTimeout(connect, reconnectDelay);
      reconnectDelay *= 2;
    }
  };

  const send = (msg) => {
    try {
      store.getState().ws.send(JSON.stringify(msg));
      return true;
    } catch(e) {
      queue.push(msg);
      return false;
    }
  };
  connect();

  return {send};
};

const server = Server(store);

class App extends Component {
  render() {
    return <Provider store={store}><SetContainer server={server}/></Provider>
  }
}
AppRegistry.registerComponent('client', () => App);



