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
    board: React.PropTypes.array
  },

  render() {
    return <SetView board={this.props.board} />;
  }
});


export default connect(state => {return state})(SetContainer);
