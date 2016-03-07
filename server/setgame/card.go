package setgame

var colors = []string{"RED", "PURPLE", "GREEN"}
var shapes = []string{"OVAL", "SQUIGGLE", "DIAMOND"}
var fills = []string{"SOLID", "STRIPED", "EMPTY"}
var numbers = []int{1, 2, 3}

// Card represents a Set card
type Card struct {
	Color  string
	Shape  string
	Fill   string
	Number int
	Id     int
}
