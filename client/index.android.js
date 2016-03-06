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
      return Object.assign({}, state, {board: action.board});
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

    case "SUBMIT_SET":
      // lol gross
      ws.send(JSON.stringify(action));
      return state;


    default:
      return state;
  }
};

const store = createStore(reduce);

store.dispatch({type: "INIT"});


class App extends Component {
  render() {
    return <Provider store={store}><SetContainer /></Provider>
  }
}

const ws = new WebSocket('ws://localhost:8080/');
ws.onopen = () => {
  // connection opened
  store.dispatch({type: "ADD_WS", ws: ws});
  ws.send(JSON.stringify({type: "JOIN_GAME", playerId: 0}));
};

ws.onmessage = (e) => {
  // a message was received
  const message = JSON.parse(e.data);
  store.dispatch(message);
};

AppRegistry.registerComponent('client', () => App);



