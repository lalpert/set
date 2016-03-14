'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Animated
} from 'react-native';

export default React.createClass({
  render() {
    const players = this.props.players.map(player =>
      <View key={player.id} onLayout={(ev) => this.props.playersLocationUpdated(player.id, ev)}>
        <PlayerView animatedStyle={this.playerStyle(player.id)} {...player} />
      </View>
    );
    return <View style={styles.playersGrid}>{players}</View>
  },

  playerStyle(id) {
    if (this.props.isPlayerClaiming(id) && this.props.claimedAnimation){
      return {
        backgroundColor: this.props.claimedAnimation.interpolate({inputRange: [0,1],outputRange: [0x00FF0000, 0x00FF0011]})
      }
    } else {
      return {}
    }
  },
  propTypes: {
    players: React.PropTypes.array.isRequired,
    playersLocationUpdated: React.PropTypes.func.isRequired,
    claimedAnimation: React.PropTypes.object.isRequired,
    isPlayerClaiming: React.PropTypes.func.isRequired
  }
});

const PlayerView = React.createClass({
  render() {
    return <Animated.View style={[this.props.animatedStyle, styles.player]}>
      <Text>Player: {this.props.id}</Text>
      <Text>Score: {this.props.score}</Text>
    </Animated.View>;
  },

  propTypes: {
    id: React.PropTypes.number.isRequired,
    score: React.PropTypes.number.isRequired,
    animatedStyle: React.PropTypes.object
  }

});

const styles = StyleSheet.create({
  player: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 3,
    padding: 5,
    margin: 5
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }
});
