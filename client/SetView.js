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
  Websocket,
  Animated,
  LayoutAnimation
} from 'react-native';

import Button from 'react-native-button'

import Util from './Util'

export default React.createClass({
  getDefaultProps() {
    return { board: [] }
  },


  render() {
    var cards = this.props.board.map(card => {
      const opacity = this.props.isCardClaimed(card.id) ? this.props.claimedAnimation : 1;
      return <Animated.View key={card.id} style={{opacity: opacity}}>
        <SetCard {...card} selected={this.props.selected.indexOf(card.id) != -1} onClick={this.props.onSelect} />
      </Animated.View>
    });

    const fillerCard = (n) => {
      return <View key={100+n} style={styles.cardBuffer} />
    };

    const rows = Util.Grouped(cards, 3, fillerCard);

    const renderableRows = rows.map((row, index) => {
      return <View key={index} style={styles.cardRow}>{row}</View>
    });

    const canSubmit = this.props.selected.length == 3;

    return (
      <View style={styles.container}>
        {renderableRows}
        <Button style={{fontSize: 20}} containerStyle={styles.button} disabled={!canSubmit} onPress={this.props.onSubmit}>
          Submit Set!
        </Button>
      </View>
    );
  },



  propTypes: {
    board: React.PropTypes.array.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    isCardClaimed: React.PropTypes.func.isRequired
  }
});

const SetCard = React.createClass({
  getInitialState() {
    return {
      fadeIn: new Animated.Value(0)
    }
  },

  componentWillMount() {
    this.state.fadeIn.setValue(0);
    Animated.timing(          // Uses easing functions
      this.state.fadeIn,    // The value to drive
      {toValue: 1, duration: 1000}           // Configuration
    ).start();
  },

  onClick() {
    if (this.props.onClick) {
      this.props.onClick(this.props.id, !this.props.selected);
    }
  },

  render() {
    return <Animated.View style={[{opacity: this.state.fadeIn}]}>
        <TouchableNativeFeedback onPress={this.onClick}>
          <View style={[styles.card, this.selectedStyle()]}>
            {this.setIcons()}
          </View>
          </TouchableNativeFeedback>
      </Animated.View>;
  },

  setIcons() {
    const res = [<View key={-1} style={styles.buffer} />];
    for (var i = 0; i < this.props.number; i++) {
      res.push(<Text key={i} style={this.iconStyle()}>{this.unicodeForCard()}</Text>);
      res.push(<View key={10+i} style={styles.buffer} />);
    }
    return res;
  },

  unicodeForCard() {
    return String.fromCharCode(this.globalOffset() + this.shadeOffset() + this.shapeOffset());
  },

  globalOffset() {
    return 0xe600;
  },

  shadeOffset() {
    switch(this.props.fill) {
      case 'solid':
        return 0;
      case 'striped':
        if (this.props.shape == 'diamond') {
          return 1;
        } else {
          return 2;
        }
      case 'empty':
        if (this.props.shape == 'diamond') {
          return 2;
        } else {
          return 1;
        }
      default:
        console.error("Invalid fill:", this.props.fill);
    }
  },

  selectedStyle() {
    if (this.props.selected) {
      return {
        borderColor: 'blue',
        backgroundColor: '#cceeff'
      }
    }
  },

  iconStyle() {
    return {
      fontFamily: 'icomoon',
      color: this.props.color,
      fontSize: 50,
    }
  },


  shapeOffset() {
    switch(this.props.shape) {
      case 'diamond':
        return 0;
      case 'squiggle':
        return 3;
      case 'oval':
        return 6;
      default:
        console.error("Invalid shape");
    }
  },

  propTypes: {
    id: React.PropTypes.number.isRequired,

    shape: React.PropTypes.string.isRequired,
    color: React.PropTypes.string.isRequired,
    fill: React.PropTypes.string.isRequired,
    number: React.PropTypes.number.isRequired,

    selected: React.PropTypes.bool.isRequired,

    // (id, selected: bool)
    onClick: React.PropTypes.func
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },

  cardRow: {
    justifyContent: 'center',
    flexDirection: 'row',
  },

  button: {
    borderColor: 'black',
    borderRadius: 2,
    borderWidth: 2,
    padding: 10,
    margin: 10
  },

  buffer: {
    width: 5
  },

  cardBuffer: {
    height: 58,
    width: 90,
    margin: 10,
  },

  card: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    height: 58,
    width: 90,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10
  },
});
