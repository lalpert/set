/**
 * Created by russell on 3/3/16.
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

export default React.createClass({
  getDefaultProps() {
    return { board: [] }
  },

  render() {
    const cards = this.props.board.map(card => {
      return <SetCard key={card.id} {...card} />;
    });

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native! Hello Leah
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.android.js
        </Text>
        <Text style={styles.instructions}>
          Shake or press menu button for dev menu
        </Text>
        {cards}
      </View>
    );
  },

  propTypes: {
    board: React.PropTypes.array
  }
});

const SetCard = React.createClass({
  getInitialState() {
    return {
      clicked: false,
    }
  },

  onClick() {
    this.setState({clicked: !this.state.clicked});
  },


  render() {
    return <TouchableNativeFeedback onPress={this.onClick}>
      <View style={styles.card}>
        <Text>{this.props.shape}{this.props.color}{this.props.fill}{this.props.number}{this.state.clicked.toString()}
        </Text>
      </View>
    </TouchableNativeFeedback>;
  },

  propTypes: {
    shape: React.PropTypes.string.isRequired,
    color: React.PropTypes.string.isRequired,
    fill: React.PropTypes.string.isRequired,
    number: React.PropTypes.number.isRequired,
  }
});


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },

  card: {
    height: 58,
    width: 90,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
  },
});
