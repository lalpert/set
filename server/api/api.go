package api

import (
	"setgame"

)
// This class is the one that knows about both the game and the hub

// Options for message types 
const (
    // Declare that you are a new player joining the game
    NewPlayer = "newPlayer"
    // Declare that you are a previous player coming back
    ReregisterPlayer  = "ReregisterPlayer"
    // Declare that you have found a set with the given cards
	ClaimSet  = "ClaimSet"
    // Ask for 3 more cards to be dealt
	DealMore = "DealMore"
)

// API holds the variables that the API needs to keep track of
type API struct {
  game *Game
 playerMap map[*connection]Player
inactivePlayers map[uuid]Player
}


var api = Api{
    game: nil,
	playerMap:     make(map[*connection]Player),
    inactivePlayers:  make(map[uuid]Player),
}


func (api *Api) initGame() {
    api.game = setgame.newGame()
}

func  (api *Api) newPlayer(incomingConnection) {
    player := game.addNewPlayer()
    api.playerMap[incomingConnection] = player
}

func  (api *Api) reregisterPlayer(incomingConnection, message) {
    player, err = getPlayer(message.secret);
    if (err) {
        return err
    }
    api.playerMap[incomingConnection] = player
}

func  (api *Api) claimSet(incomingConnection, message) {
          player  := getPlayerByConnection(incomingConnection, game.Players)
          cards := getCards(message)
          response, err := api.game.claimSet(player, cards)
          return response, err
}

func  (api *Api) unregisterConnection(incomingConnection) {
    // move player to list of inactive players
}

func  (api *Api) handleMsg(incomingConnection, message) {
    switch message.Type {
        case NewPlayer: // todo
          response, err = newPlayer(message)
        case ClaimSet:
           response, err = claimSet(incomingConnection, message)

    }
          
        if (err) {
            code = err.code
            respondWith(err, code)
            return
        } 
        respondWith(reponse) // maybe break into multiple    
}



// FoundSet - check that card are on board, cards make a set
// then remove cards from board, deal new cards
// tell clients: {player: X, removeCards: X, addCards: X}


// DealMore
// add 3 cards to board
// return {player: X, newCards: X}