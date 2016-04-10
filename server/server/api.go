package main

import (
	"encoding/json"
	"errors"

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
)

// API holds the variables that the API needs to keep track of
type API struct {
	game            *setgame.Game
	playerMap       map[*connection]*setgame.Player
	inactivePlayers map[int32]*setgame.Player // int is the player's id
	sequenceNum     int                       // Use to declare the order of messages sent to client
}

var api = API{
	game:            nil,
	playerMap:       make(map[*connection]*setgame.Player),
	inactivePlayers: make(map[int32]*setgame.Player),
}

func (api *API) initGame() {
	api.game = setgame.NewGame()
}

func (api *API) newPlayer(incomingConnection *connection, name string) {
	player := setgame.CreateNewPlayer(name)
	api.playerMap[incomingConnection] = player
}

func (api *API) getActivePlayerById(id int32) (*setgame.Player, *connection, error) {
	for conn, player := range api.playerMap {
		if player.ID == id {
			return player, conn, nil
		}
	}
	return nil, nil, errors.New("No player found with given ID")
}

func (api *API) getInactivePlayerById(id int32) (*setgame.Player, error) {
	player, ok := api.inactivePlayers[id]
	if !ok {
		return nil, errors.New("No player found with given ID")
	}
	return player, nil
}

type submitSetMessage struct {
	Cards []int `json:"cards"` // list of card ids
}

func (api *API) unregisterConnection(conn *connection) {
	// If player leaves game, move them to list of inactive players
	player, ok := api.playerMap[conn]
	if ok {
		delete(api.playerMap, conn)
		api.inactivePlayers[player.ID] = player
		api.sendBoardStateToAll()
	}
}

func (api *API) joinGame(conn *connection, message []byte) {
	joinGameRequest := &nameMessage{}
	err := json.Unmarshal(message, joinGameRequest)
	if err != nil {
		api.respondWithError(conn, err)
		return
	}
	api.newPlayer(conn, joinGameRequest.Name)
	api.sendIDAndSecret(conn)
	api.sendBoardStateToAll()
}

func (api *API) rejoinGame(conn *connection, message []byte) {
	idSecretRequest := &idSecretMessage{}
	err := json.Unmarshal(message, idSecretRequest)
	if err != nil {
		api.respondWithError(conn, err)
		return
	}
	// First try to find player in active players
	player, oldConn, err := api.getActivePlayerById(idSecretRequest.ID)
	// If no player found/error, then try to find them in inactive players
	if player == nil {
		player, err = api.getInactivePlayerById(idSecretRequest.ID)
	}
	if player == nil || err != nil {
		api.respondWithError(conn, err)
		return
	}

	if player.Secret != idSecretRequest.Secret {
		api.respondWithError(conn, errors.New("Secret does not match ID"))
		return
	}

	//  Null out old connection
	delete(api.playerMap, oldConn)

	// Add new connection
	api.playerMap[conn] = player
	api.sendBoardStateToAll()
}

func (api *API) claimSet(conn *connection, message []byte) {
	claimSetRequest := &submitSetMessage{}
	mashallError := json.Unmarshal(message, claimSetRequest)
	if mashallError != nil {
		api.respondWithError(conn, mashallError)
		return
	}
	action, err := api.claimSetFromRequest(conn, *claimSetRequest)
	if err != nil {
		// TODO: distinguish between invalid move and error
		api.respondWithError(conn, err)
		return
	}

	api.sendBoardStateToAllWithActions(*action)
	if api.game.GameOver() {
		gameOverAction := setgame.Action{Type: "GAME_OVER", PlayerID: -1, CardIds: nil}
		api.initGame()
		api.sendBoardStateToAllWithActions(gameOverAction)
	}
}

func (api *API) claimSetFromRequest(conn *connection, request submitSetMessage) (*setgame.Action, error) {
	if player, ok := api.playerMap[conn]; ok {
		err := api.game.ClaimSetByIds(player, request.Cards)
		if err != nil {
			return &setgame.Action{"SET_INVALID", player.ID, request.Cards}, nil
		} else {
			return &setgame.Action{"SET_CLAIMED", player.ID, request.Cards}, nil
		}
	}
	log.Println("Error: no player found for connection")
	return nil, errors.New("No player found for connection. Has player joined game?")
}

func (api *API) handleMsg(conn *connection, request Request, message []byte) {
	log.Println("Got message: ", request)
	switch request.Type {
	case JoinGame:
		api.joinGame(conn, message)
	case RejoinGame:
		api.rejoinGame(conn, message)
	case ClaimSet:
		api.claimSet(conn, message)
	}
}

func (api *API) sendIDAndSecret(conn *connection) {
	player := api.playerMap[conn]
	response := idSecretMessage{"JOIN_ACCEPTED", player.ID, player.Secret}
	sendResponse(conn, response)
}

func (api *API) respondWithError(conn *connection, err error) {
	response := errorResponse{"ERROR", err.Error()}
	sendResponse(conn, response)
}

func (api *API) respondWithType(conn *connection, typeString string) {
	response := typeResponse{typeString}
	sendResponse(conn, response)
}

func (api *API) respondWithTypeToAll(typeString string) {
	response := typeResponse{typeString}
	api.sendResponseToAll(response)
}

func (api *API) sendBoardState(conn *connection) {
	response := boardResponse{"SET_BOARD", api.game.GetBoardCards(), api.getPlayers(), nil, api.sequenceNum}
	sendResponse(conn, response)
}

func (api *API) sendBoardStateWithActions(conn *connection, action *setgame.Action) {
	response := boardResponse{"SET_BOARD", api.game.GetBoardCards(), api.getPlayers(), action, api.sequenceNum}
	sendResponse(conn, response)
}

func (api *API) sendBoardStateToAll() {
	response := boardResponse{"SET_BOARD", api.game.GetBoardCards(), api.getPlayers(), nil, api.sequenceNum}
	api.sendResponseToAll(response)
}

func (api *API) sendBoardStateToAllWithActions(action setgame.Action) {
	response := boardResponse{"SET_BOARD", api.game.GetBoardCards(), api.getPlayers(), &action, api.sequenceNum}
	api.sendResponseToAll(response)
}

func (api *API) getPlayers() []setgame.Player {
	players := []setgame.Player{} // todo is there a 1-liner for this?
	for _, p := range api.playerMap {
		players = append(players, *p) // todo dedupe
	}
	return players
}

func sendResponse(conn *connection, response interface{}) {
	api.sequenceNum++
	stringResponse, _ := json.Marshal(response)
	log.Println("Responding to one:", string(stringResponse))
	conn.ws.WriteMessage(websocket.TextMessage, stringResponse)
}

func (api *API) sendResponseToAll(response interface{}) {
	api.sequenceNum++
	stringResponse, _ := json.Marshal(response)
	log.Println("Responding to all:", string(stringResponse))
	for conn := range api.playerMap {
		conn.ws.WriteMessage(websocket.TextMessage, stringResponse)
	}
}

// TODO inheritance for response/message types
type nameMessage struct {
	Name string `json:"name"`
}

type idSecretMessage struct {
	MsgType string `json:"type"`
	ID      int32  `json:"id"`
	Secret  int32  `json:"secret"`
}

type boardResponse struct {
	MsgType     string           `json:"type"`
	GameBoard   []setgame.Card   `json:"board"`
	Players     []setgame.Player `json:"players"`
	Action      *setgame.Action  `json:"action"`
	SequenceNum int              `json:"seq"`
}

type errorResponse struct {
	MsgType  string `json:"type"`
	ErrorMsg string `json:"error"`
}

type typeResponse struct {
	MsgType string `json:"type"`
}
