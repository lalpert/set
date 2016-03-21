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
	inactivePlayers map[int]*setgame.Player // int is the player's uuid
}

var api = API{
	game:            nil,
	playerMap:       make(map[*connection]*setgame.Player),
	inactivePlayers: make(map[int]*setgame.Player), // int is the uuid
}

func (api *API) initGame() {
	api.game = setgame.NewGame()
}

func (api *API) newPlayer(incomingConnection *connection) {
	player := setgame.CreateNewPlayer("")
	api.playerMap[incomingConnection] = player
}

func (api *API) getPlayer(id int32, secret int32) (*setgame.Player, error) {
	for _, player := range api.playerMap {
		if player.ID == id {
			if player.Secret != secret {
				return nil, errors.New("Secret does not match ID")
			}
			return player, nil
		}
	}
	return nil, errors.New("No player found with given ID")
}

type submitSetMessage struct {
	Cards []int `json:"cards"` // list of card ids
}

func (api *API) unregisterConnection(conn *connection) {
	// move player to list of inactive players
}

func (api *API) joinGame(conn *connection) {
	api.newPlayer(conn)
	api.sendIDAndSecret(conn)
	api.sendBoardState(conn)
	api.sendBoardStateToAll()
}

func (api *API) rejoinGame(conn *connection, message []byte) {
	idSecretRequest := &idSecretMessage{}
	err := json.Unmarshal(message, idSecretRequest)
	if err != nil {
		api.respondWithError(conn, err)
		return
	}
	player, err := api.getPlayer(idSecretRequest.ID, idSecretRequest.Secret)
	if err != nil {
		api.respondWithError(conn, err)
		return
	}
	api.playerMap[conn] = player // TODO null out old connection
	api.sendBoardState(conn)
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
	} else {
		api.sendBoardStateToAllWithActions(*action)
		if api.game.GameOver() {
			api.respondWithTypeToAll("GAME_OVER")
			api.initGame()
			api.sendBoardStateToAll()
		}
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
		api.joinGame(conn)
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
	response := boardResponse{"SET_BOARD", api.game.GetBoardCards(), api.getPlayers(), nil}
	sendResponse(conn, response)
}

func (api *API) sendBoardStateWithActions(conn *connection, action *setgame.Action) {
	response := boardResponse{"SET_BOARD", api.game.GetBoardCards(), api.getPlayers(), action}
	sendResponse(conn, response)
}

func (api *API) sendBoardStateToAll() {
	response := boardResponse{"SET_BOARD", api.game.GetBoardCards(), api.getPlayers(), nil}
	api.sendResponseToAll(response)
}

func (api *API) sendBoardStateToAllWithActions(action setgame.Action) {
	response := boardResponse{"SET_BOARD", api.game.GetBoardCards(), api.getPlayers(), &action}
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
	stringResponse, _ := json.Marshal(response)
	log.Println("Responding to one:", string(stringResponse))
	conn.ws.WriteMessage(websocket.TextMessage, stringResponse)
}

func (api *API) sendResponseToAll(response interface{}) {
	stringResponse, _ := json.Marshal(response)
	log.Println("Responding to all:", string(stringResponse))
	for conn := range api.playerMap {
		conn.ws.WriteMessage(websocket.TextMessage, stringResponse)
	}
}

// TODO inheritance for response/message types

type idSecretMessage struct {
	MsgType string `json:"type"`
	ID      int32  `json:"id"`
	Secret  int32  `json:"secret"`
}

type boardResponse struct {
	MsgType   string           `json:"type"`
	GameBoard []setgame.Card   `json:"board"`
	Players   []setgame.Player `json:"players"`
	Action    *setgame.Action  `json:"action"`
}

type errorResponse struct {
	MsgType  string `json:"type"`
	ErrorMsg string `json:"error"`
}

type typeResponse struct {
	MsgType string `json:"type"`
}
