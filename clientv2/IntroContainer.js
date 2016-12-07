/**
 * Created by russell on 3/20/16.
 */

import React from 'react';
import { View, StyleSheet, TextInput, AsyncStorage, Text } from 'react-native';
import Button from 'react-native-button'
import { connect } from 'react-redux';

const IntroContainer = React.createClass({
  nameUpdated(name) {
    this.props.dispatch({type: "SET_NAME", name});
    AsyncStorage.setItem("name", name);
  },

  render() {
    return <View>
      <Button style={{fontSize: 20}}
              containerStyle={styles.button}
              disabled={!this.props.gotoMultiplayerGlobal || !this.props.connected}
              onPress={this.props.gotoMultiplayerGlobal}>
        {this.props.connected ? "Multiplayer Public" : "Multiplayer Public (No internet)" }
      </Button>
      <Button style={{fontSize: 20}}
              containerStyle={styles.button}
              disabled={!this.props.gotoMultiplayerNamedGame}
              onPress={this.props.gotoMultiplayerNamedGame}>
        Multiplayer Private
      </Button>
      <Button style={{fontSize: 20}}
              containerStyle={styles.button}
              disabled={!this.props.gotoSinglePlayer}
              onPress={this.props.gotoSinglePlayer}>
        Single Player
      </Button>
      <View style={styles.nameContainer}>
        <Text>Name</Text>
        <TextInput
          style={styles.nameInput}
          onChangeText={this.nameUpdated}
          value={this.props.player.name}
        />
      </View>
    </View>;
  },

  propTypes: {
    player: React.PropTypes.object,
    gotoMultiplayerGlobal: React.PropTypes.func,
    gotoMultiplayerNamedGame: React.PropTypes.func,
    gotoSinglePlayer: React.PropTypes.func,
  }
});

const styles = StyleSheet.create({
  nameContainer: {
    borderColor: 'red',
    borderWidth: 0,
    //flex: 1,
    justifyContent: 'center',
    padding: 50
  },

  nameInput: {
    height: 60,
    borderColor: 'gray',
    borderWidth: 2,
    fontSize: 36
  },

  button: {
    borderColor: 'black',
    borderRadius: 2,
    borderWidth: 2,
    padding: 10,
    margin: 10
  },
});

export default connect(state => {
  return state
})(IntroContainer);
