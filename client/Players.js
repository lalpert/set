'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default React.createClass({
  render() {
    const players = this.props.players.map(player =>
      <View key={player.id} onLayout={(ev) => this.props.playersLocationUpdated(player.id, ev)}>
        <PlayerView {...player} />
      </View>
    );
    return <View style={styles.playersGrid}>{players}</View>
  },

  propTypes: {
    players: React.PropTypes.array.isRequired,
    playersLocationUpdated: React.PropTypes.func.isRequired
  }
});

const PlayerView = React.createClass({
  render() {
    return <View style={styles.player}>
      <Text>Player: {this.props.id}</Text>
      <Text>Score: {this.props.score}</Text>
    </View>;
  },

  propTypes: {
    id: React.PropTypes.number.isRequired,
    score: React.PropTypes.number.isRequired,
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
