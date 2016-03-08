package setgame

import "errors"

// Game represents a Set game
type Game struct {
	deck  Deck
	board Board
}

// NewGame creates a new game of set with a shuffled deck, board is 12 random cards, no players
func NewGame() *Game {
	deck := createShuffledDeck()
	board := Board{deck.deal(12)}
	game := &Game{deck, board}
	game.addCardsIfNoSet()
	return game
}

// ClaimSetByIds takes a Player and a list of card IDs, checks if those cards make a valid set,
// and if so replaces them with new cards
func (g *Game) ClaimSetByIds(player *Player, cardIDs []int) error {

	if len(cardIDs) != 3 {
		return errors.New("Set must contain 3 cards")
	}

	setCards := g.board.getCardsByID(cardIDs)
	if len(setCards) != 3 {
		return errors.New("Not all cards are on board")
	}

	if !isSet(setCards[0], setCards[1], setCards[2]) {
		return errors.New("Not a set")
	}

	// If we get here, cards are on board and they are a set!
	player.Score++

	if len(g.board.cards) > 12 || len(g.deck.cards) == 0 {
		// If we can't or don't want to deal new cards, just remove set cards
		g.board.remove(setCards)
	} else {
		// Else deal new cards to replace old ones
		g.board.replace(setCards, g.deck.deal(3))
	}

	g.addCardsIfNoSet()

	//return cards, Player.score
	return nil

}

// GetBoardCards returns the cards on the game board
func (g *Game) GetBoardCards() []Card {
	return g.board.cards
}

// addCardsIfNoSet adds cards to the board in sets of 3 until the board contains a set
// Returns whether it was able to do so
func (g *Game) addCardsIfNoSet() bool {
	for !g.board.ContainsSet() {
		if len(g.deck.cards) == 0 {
			return false
		}
		g.board.cards = append(g.board.cards, g.deck.deal(3)...)
	}
	return true
}

// GameOver returns whether the game is over
func (g *Game) GameOver() bool {
	return !g.board.ContainsSet()
}

func isSet(firstCard Card, secondCard Card, thirdCard Card) bool {
	colorsMatch := stringMakesSet(firstCard.Color, secondCard.Color, thirdCard.Color)
	numbersMatch := intMakesSet(firstCard.Number, secondCard.Number, thirdCard.Number)
	fillsMatch := stringMakesSet(firstCard.Fill, secondCard.Fill, thirdCard.Fill)
	shapesMatch := stringMakesSet(firstCard.Shape, secondCard.Shape, thirdCard.Shape)
	return colorsMatch && numbersMatch && fillsMatch && shapesMatch
}

func stringMakesSet(first string, second string, third string) bool {
	return ((first == second && second == third) ||
		(first != second && second != third && first != third))
}

func intMakesSet(first int, second int, third int) bool {
	return ((first == second && second == third) ||
		(first != second && second != third && first != third))
}
