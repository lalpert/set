package main

import (
	"encoding/json"

	"log"

	"github.com/gorilla/websocket"
	"github.com/lalpert/set/server/setgame"
)

// This class is the one that knows about both the game and the hub

// Options for message types
const (
	// Declare that you are a new player joining the game
	JoinGame = "JOIN_GAME"
	// Declare that you are a previous player coming back
	RejoinGame = "REJOIN_GAME"
	// Declare that you have found a set with the given cards
	ClaimSet = "CLAIM_SET"
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

func (api *API) claimSet(conn *connection, request submitSetMessage) error {
	player := api.game.Players[10101] //getPlayerByConnection(conn, game.Players)
	_, err := api.game.ClaimSetByIds(player, request.cards)
	return err // for now, no return value
}

func (api *API) unregisterConnection(conn *connection) {
	// move player to list of inactive players
}

func (api *API) handleMsg(conn *connection, request Request, message []byte) {
	log.Println("Got message: ", request)
	switch request.Type {
	case JoinGame:
		api.sendBoardState(conn)
	case ClaimSet:
		claimSetRequest := &submitSetMessage{}
		err := json.Unmarshal(message, claimSetRequest)
		if err != nil {
			api.respondWithError(conn, err)
			return
		}
		err = api.claimSet(conn, *claimSetRequest)
		if err != nil {
			api.respondWithError(conn, err)
		}
		api.sendBoardState(conn)
	}
}

func (api *API) respondWithError(conn *connection, err error) {
	conn.ws.WriteMessage(websocket.TextMessage, []byte(err.Error()))
}

func (api *API) sendBoardState(conn *connection) {
	response := boardResponse{"board", api.game.GetBoard()}
	stringResponse, _ := json.Marshal(response)
	conn.ws.WriteMessage(websocket.TextMessage, stringResponse)
}

type boardResponse struct {
	MsgType   string        `json:"type"`
	GameBoard setgame.Board `json:"board"`
}
