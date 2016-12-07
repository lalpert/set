/**
 * Created by russell on 4/15/16.
 */

// card: {
//    shape,
//    color:
//    fill:
//    number:
import _ from 'lodash-es'
const createDeck = () => {
  const shapes = ["diamond", "squiggle", "oval"];
  const colors = ["red", "green", "purple"];
  const fills = ["solid", "striped", "empty"];
  const numbers = [1,2,3];

  let id = 0;
  const cards = _.flatMap(shapes, shape => {
    return _.flatMap(colors, color => {
      return _.flatMap(fills, fill => {
        return numbers.map(number => {
          id += 1;
          return {shape, color, fill, number, id}
        });
      });
    });
  });
  return _.shuffle(cards);
};

const makesSet = (items) => {
  const iset = new Set(items);
  return iset.size == 1 || iset.size == 3;
};


const findSet = (board) => {
  for (let i = 0; i < board.length; i++) {
    for (let j = i + 1; j < board.length; j++) {
      for (let k = j + 1; k < board.length; k++) {
        if (cardsAreSet([board[i], board[j], board[k]])) {
          console.log("Found: ", board[i], board[j], board[k]);
          return true;
        }
      }
    }
  }
  return false;
};

const cardsAreSet = (cards) => {
  console.log("checking: ", cards)
  const colorsAreSet = makesSet(_.map(cards, x => x.color));
  const shapesAreSet = makesSet(_.map(cards, x => x.shape));
  const fillsAreSet = makesSet(_.map(cards, x => x.fill));
  const numbersAreSet = makesSet(_.map(cards, x => x.number));
  return colorsAreSet && shapesAreSet && fillsAreSet && numbersAreSet;
};

export default (dispatch) => {
  let deck = [];
  let board = [];
  let seq = 0;

  const ensureEnoughCards = () => {
    while(board.length < 12 || (!findSet(board) || board.length % 3 != 0)) {
      if (deck.length == 0 && !findSet(board)) {
        // TODO: send game over
        board = [];
        dealDeck();
        ensureEnoughCards();
      }
      board = [...board, ...deck.splice(0, 1)];
    }
  };

  const dealDeck = () => {
    deck = createDeck();
  };

  const reply = (message) => {
    seq += 1;
    message.seq = seq;
    dispatch(message);
  };

  let score = 0;
  const players = () => [{id: 0, secret: 0, name: "YOU", score}];

  const sendIntro = () => {
    reply({
      type: "CLEAR"
    });
    reply({
      type: "JOIN_ACCEPTED",
      id: "LOCAL",
      secret: "LOCAL"
    });

    reply({
      type: "SET_BOARD",
      board: board,
      players: players(),
    });
  };


  dealDeck();
  ensureEnoughCards();
  sendIntro();

  const tryRemoveSet = (cards) => {
    if (cards.length != 3 || !cardsAreSet(cards)) {
      return false;
    }

    cards.forEach(card => {
      const cardIndex = board.findIndex(el => el.id == card.id);
      if (board.length == 12) {
        board = [...board.slice(0, cardIndex), ...deck.splice(0, 1), ...board.slice(cardIndex+1)];
      } else {
        board = [...board.slice(0, cardIndex), ...board.slice(cardIndex+1)];
      }
    });
    ensureEnoughCards();

    score += 1;
    return true;
  };

  const send = (message) => {
    switch(message.type) {
      case "CLAIM_SET":
        const {cards: cardIds} = message;
        const cards = cardIds.map(cardId => board.find(_ => _.id == cardId));
        const success = tryRemoveSet(cards);
        if (success) {
          reply({type: "SET_BOARD", players: players(), board, action: {type: "SET_CLAIMED", cardIds, playerId: 0}});
        } else {
          reply({type: "SET_BOARD", players: players(), board, action: {type: "SET_INVALID", cardIds, playerId: 0}});
        }
    }
  };
  return {send};
}
