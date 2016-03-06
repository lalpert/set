package main

import (
	"encoding/json"

	"github.com/lalpert/set/server/setgame"
)

// This class is the one that knows about both the game and the hub

// Options for message types
const (
	// Declare that you are a new player joining the game
	NewPlayer = "newPlayer"
	// Declare that you are a previous player coming back
	ReregisterPlayer = "ReregisterPlayer"
	// Declare that you have found a set with the given cards
	ClaimSet = "ClaimSet"
	// Ask for 3 more cards to be dealt
	DealMore = "DealMore"
)

// API holds the variables that the API needs to keep track of
type API struct {
	game            *setgame.Game
	playerMap       map[*connection]setgame.Player
	inactivePlayers map[int]setgame.Player // int is the player's uuid
}

var api = API{
	game:            nil,
	playerMap:       make(map[*connection]setgame.Player),
	inactivePlayers: make(map[int]setgame.Player), // int is the uuid
}

func (api *API) initGame() {
	api.game = setgame.NewGame()
}

/*
func  (api *API) newPlayer(incomingConnection *connection) {
    player := api.game.AddNewPlayer()
    api.playerMap[incomingConnection] = player
}

func  (api *API) reregisterPlayer(incomingConnection, message) {
    player, err = getPlayer(message.secret);
    if (err) {
        return err
    }
    api.playerMap[incomingConnection] = player
}
*/

type submitSetMessage struct {
	cards []int // list of card ids
}

func (api *API) claimSet(conn *connection, request submitSetMessage) error{
	player := api.game.Players[10101] //getPlayerByConnection(conn, game.Players)
	response, err := api.game.ClaimSetByIds(player, request.cards)
	return response, err
}

func (api *API) unregisterConnection(conn *connection) {
	// move player to list of inactive players
}

func (api *API) handleMsg(conn *connection, request Request, message []byte) {
	switch request.Type {
	case ClaimSet:
		claimSetRequest := &submitSetMessage{}
		err := json.Unmarshal(message, claimSetRequest)
		response, err := api.claimSet(conn, claimSetRequest)

		//        case NewPlayer: // todo
		//response, err := newPlayer(request)

	}

	if err {
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
