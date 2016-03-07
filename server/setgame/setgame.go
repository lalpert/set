package setgame

import (
	"errors"
)

// UUID is a player's unique id. It is not a secret.
type UUID int

// Player represents a player for one game
type Player struct {
	name   string
	uuid   UUID
	secret string // secret that only this client should know, used mainly to register if dropped
	score  int    // number of sets
}

// Game represents a Set game
type Game struct {
	Players map[UUID]Player
	deck    Deck
	board   Board
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

// NewGame creates a new game of set with a shuffled deck, board is 12 random cards, no players
func NewGame() *Game {
	players := make(map[UUID]Player)

	// FOR NOW: add a fake player 1
	player1 := Player{"Fake Player", 10101, "secretcode", 0}
	players[10101] = player1

	deck := createShuffledDeck()
	board := deck.deal(12)
	game := &Game{players, deck, board}
	game.addCardsIfNoSet()
	return game
}

/*
func (g *Game) addNewPlayer(name string) Player{
    uuid = createRandomUuid()
    secret = createRandomSecret()
    score = 0
    player := Player{uuid:uuid, secret:secret, score:score, name:name}
    g.players[uuid] = player
    return player
}
*/

// ClaimSetByIds takes a Player and a list of card IDs, checks if those cards make a valid set,
// and if so replaces them with new cards
func (g *Game) ClaimSetByIds(player Player, cardIDs []int) ([]Card, error) {

	if len(cardIDs) != 3 {
		return nil, errors.New("Set must contain 3 cards")
	}

	setCards := g.board.getCardsByID(cardIDs)
	if len(setCards) != 3 {
		return nil, errors.New("Not all cards are on board")
	}

	if !isSet(setCards[0], setCards[1], setCards[2]) {
		return nil, errors.New("Not a set")
	}

	// If we get here, cards are on board and they are a set!
	player.score++
	newCards := g.deck.deal(3) // todo what if we're out of cards
	g.board.replace(setCards, newCards)
	g.addCardsIfNoSet()

	//return cards, Player.score
	return setCards, nil

}

// GetBoard returns the game board
func (g *Game) GetBoard() Board {
	return g.board
}

// addCardsIfNoSet adds cards to the board in sets of 3 until the board contains a set
func (g *Game) addCardsIfNoSet() {
	for !g.board.ContainsSet() {
		g.board = append(g.board, g.deck.deal(3)...)
	}
}
