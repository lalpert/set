/**
 * Created by russell on 3/3/16.
 */
'use strict';

import React, { Text } from 'react-native';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import SetView from './SetView'

const SetContainer = React.createClass({
  propTypes: {
    board: React.PropTypes.array,
    server: React.PropTypes.object.isRequired
  },

  render() {
    return <SetView
      board={this.props.board}
      selected={this.props.selected}
      onSelect={this.onSelect}
      onSubmit={this.onSubmit} />;
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
  }

});


export default connect(state => {return state})(SetContainer);
