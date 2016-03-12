/**
 * Created by russell on 3/3/16.
 */
'use strict';

import React, { Text, View } from 'react-native';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import SetView from './SetView'
import Players from './Players'

const SetContainer = React.createClass({
  getInitialState() {
    return {playerPositions: {}};
  },

  render() {
    return <View>
      <SetView
        board={this.props.board}
        selected={this.props.selected}
        onSelect={this.onSelect}
        onSubmit={this.onSubmit}

        claimed={this.props.claimed}
        playerLocations={this.state.playerPositions}
      />
      <Players players={this.props.players} playersLocationUpdated={this.playerPositionUpdated}/>
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

    claimed: React.PropTypes.object
  },

});


export default connect(state => {
  return state
})(SetContainer);
