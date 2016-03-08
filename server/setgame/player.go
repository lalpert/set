package setgame

import "math/rand"

// Player represents a player for one game
type Player struct {
	Name   string `json:"name"`
	ID     int    `json:"id"` // ID is a player's unique id. It is not a secret.
	Secret int    `json:"-"`  // secret that only this client should know, used mainly to register if dropped
	Score  int    `json:"score"`
}

// CreateNewPlayer creates a new player with a random uuid and secret
func CreateNewPlayer(name string) *Player {
	uuid := rand.Int()
	secret := rand.Int() // TODO: golang rand is deterministic so this is not really secret
	score := 0
	player := Player{ID: uuid, Secret: secret, Score: score, Name: name}
	return &player
}
