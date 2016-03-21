package setgame

// Action describes the action that lead to a boardstate
type Action struct {
    Type string `json:"type"`
    PlayerID int32 `json:"playerId"`
    CardIds []int `json:"cardIds"`
}

