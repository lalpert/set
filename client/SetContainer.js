/**
 * Created by russell on 3/3/16.
 */
'use strict';

import React, { Text, View, Animated } from 'react-native';
import { connect } from 'react-redux';
import SetView from './SetView'
import Players from './Players'

const SetContainer = React.createClass({
  getInitialState() {
    return {
      playerPositions: {},
      claimedAnimation: new Animated.Value(1),
      invalidAnimation: new Animated.Value(10)
    };
  },

  componentWillReceiveProps(nextProps) {
    if (!this.props.claimed && nextProps.claimed) {
      setTimeout(nextProps.claimed.onComplete, 1000);
      Animated.timing(
        this.state.claimedAnimation,
        {toValue: 0, duration: 1000}
      ).start();
    } else if (this.props.claimed && !nextProps.claimed) {
      this.state.claimedAnimation.setValue(1);
    }

    if (!this.props.invalid && nextProps.invalid) {
      this.state.invalidAnimation.setValue(10);
      setTimeout(nextProps.invalid.onComplete, 500);
      Animated.spring(
        this.state.invalidAnimation,
        {toValue: 0, friction: 2, tension: 120}
      ).start();
    } else if (this.props.claimed && !nextProps.claimed) {
      this.state.invalidAnimation.setValue(10);
    }
  },

  isCardInvalid(id) {
    if (this.props.invalid) {
      return this.props.invalid.cards.indexOf(id) != -1;
    } else {
      return false;
    }
  },

  isCardClaimed(id) {
    if(this.props.claimed) {
      return this.props.claimed.cards.indexOf(id) != -1;
    } else {
      return false;
    }
  },

  isPlayerClaiming(id) {
    return this.props.claimed && this.props.claimed.claimer == id;
  },

  render() {
    return <View>
      <SetView
        board={this.props.board}
        selected={this.props.selected}
        onSelect={this.onSelect}
        onSubmit={this.onSubmit}

        isCardClaimed={this.isCardClaimed}
        isCardInvalid={this.isCardInvalid}

        claimedAnimation={this.state.claimedAnimation}
        invalidAnimation={this.state.invalidAnimation}

        playerLocations={this.state.playerPositions}
      />
      <Players
        claimedAnimation={this.state.claimedAnimation}
        claimed={this.props.claimed}
        players={this.props.players}
        playersLocationUpdated={this.playerPositionUpdated}

        isPlayerClaiming={this.isPlayerClaiming}
      />
    </View>
  },

  onSelect(id, selected) {
    if (selected) {
      this.props.dispatch({type: "CARD_SELECTED", cardId: id});
    } else {
      this.props.dispatch({type: "CARD_DESELECTED", cardId: id});
    }
  },

  onSubmit() {
    const event = {type: "CLAIM_SET", cards: this.props.selected};
    this.props.server.send(event);
    this.props.dispatch(event);
  },

  playerPositionUpdated(id, ev) {
    const newPositions = Object.assign({}, this.state.playerPositions, {id: ev.layout});
    this.setState({playerPositions: newPositions});
  },

  propTypes: {
    board: React.PropTypes.array,
    players: React.PropTypes.array.isRequired,
    server: React.PropTypes.object.isRequired,

    claimed: React.PropTypes.object,
    invalid: React.PropTypes.object
  },

});


export default connect(state => {
  return state
})(SetContainer);
