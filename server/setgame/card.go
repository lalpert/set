package setgame

var colors = []string{"red", "purple", "green"}
var shapes = []string{"oval", "squiggle", "diamond"}
var fills = []string{"solid", "striped", "empty"}
var numbers = []int{1, 2, 3}

// Card represents a Set card
type Card struct {
	Color  string `json:"color"`
	Shape  string `json:"shape"`
	Fill   string `json:"fill"`
	Number int    `json:"number"`
	ID     int    `json:"id"`
}
