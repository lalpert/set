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
import { createStore } from 'redux'
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


const reducer = (state, action) => {
  switch (action.type) {
    case "SET_BOARD":
      return Object.assign({}, state, {board: action.board});
    case "SET_CLAIMED":
      const remainingCards = state.board.filter(card => {
        return action.claimedSet.find(claimedCard => claimedCard.id == card.id) === undefined;
      });
      const newBoard = [...remainingCards, ...action.newCards];
      return Object.assign({}, state, {board: newBoard});
    default:
      return state;
  }
};

const store = createStore(reducer);

class App extends Component {
  render() {
    return <Provider store={store}><SetContainer /></Provider>
  }
}



AppRegistry.registerComponent('client', () => App);

store.dispatch({type: "SET_BOARD", board: [{id: 0, color: "red", shape: "squiggle", "number": 2, fill: "solid"}]});
setTimeout(() => {
  store.dispatch({type: "SET_CLAIMED", claimedSet: [{id: 0}], newCards: [{id: 1, color: "blue", shape: "squiggle", "number": 2, fill: "solid"}]})
}, 3000);


