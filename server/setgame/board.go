package setgame
import "log"
// Board is the list of cards currently on the board.
type Board []Card

func (board Board) getCardsByID(cardIds []int) []Card {
	cards := []Card{}
	for _, cardID := range cardIds {
		foundCard := board.getCardByID(cardID)
		if foundCard != nil {
			cards = append(cards, *foundCard)
		}
	}
	return cards
}

func (board Board) getCardByID(id int) *Card {
	for _, boardCard := range board {
		if boardCard.ID == id {
			return &boardCard
		}
	}
	return nil
}

func (board Board) containsCards(cards []Card) bool {
	for _, card := range board {
		if !board.containsCard(card) {
			return false
		}
	}
	return true
}

func (board Board) containsCard(card Card) bool {
	for _, boardCard := range board {
		if boardCard == card { // not gonna work because of equality check/id error
			return true
		}
	}
	return false
}

func (board Board) replace(oldCards []Card, newCards []Card) {
	for i, oldCard := range oldCards {
		board.replaceCard(oldCard, newCards[i])
	}
}

func (board Board) replaceCard(oldCard Card, newCard Card) {
	for i, boardCard := range board {
		if boardCard == oldCard {
			board[i] = newCard
			return
		}
	}
}

// ContainsSet returns whether there is at least one set on the board
func (board Board) ContainsSet() bool {
	for i := 0; i < len(board); i++ {
		for j := i + 1; j < len(board); j++ {
			for k := j + 1; k < len(board); k++ {
				if isSet(board[i], board[j], board[k]) {
					log.Println(board[i], board[j], board[k]);
					return true
				}
			}
		}
	}
	return false
}
