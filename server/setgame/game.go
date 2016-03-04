package setgame
import (
    "errors"
)

// UUID is a player's unique id. It is not a secret.
type UUID int;

// Player represents a player for one game
type Player struct{
    name string
    uuid UUID
    secret string // secret that only this client should know, used mainly to register if dropped
    score int // number of sets
}

// Game represents a Set game
type Game struct {
    players map[UUID]Player
    deck Deck
    board Board
}

func isSet(firstCard Card, secondCard Card, thirdCard Card) bool {
     colorsMatch := stringMakesSet(firstCard.color, secondCard.color, thirdCard.color);
     numbersMatch := intMakesSet(firstCard.number, secondCard.number, thirdCard.number);
     fillsMatch := stringMakesSet(firstCard.fill, secondCard.fill, thirdCard.fill);
     shapesMatch := stringMakesSet(firstCard.shape, secondCard.shape, thirdCard.shape);
     return colorsMatch && numbersMatch && fillsMatch && shapesMatch;
}

func stringMakesSet( first string,  second string,  third string) bool{
        return ((first == second && second == third) ||
                (first != second && second != third && first != third));
}

func intMakesSet( first int,  second int,  third int) bool{
        return ((first == second && second == third) ||
                (first != second && second != third && first != third));
}
  
func newGame() Game {
    players := make(map[UUID]Player)
    deck := createShuffledDeck()
    board := []Card{}
    return Game{players, deck, board}
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

func (g *Game) claimSet(player Player, setCards []Card)  ([]Card, error) {
    if (!g.board.containsCards(setCards)) {
        return nil, errors.New("Error: cards not on board")
    }
    
    if (!isSet(setCards[0],setCards[1],setCards[2] )) {
        return nil, errors.New("Not a set")
    }
    
    // If we get here, cards are on board and they are a set!
    player.score++
    newCards := g.deck.deal(3)
    g.board.replace(setCards, newCards)

    //return cards, Player.score
    return setCards, nil
}