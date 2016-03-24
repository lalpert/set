package setgame

import "log"

// Board is the list of cards currently on the board.
type Board struct {
	cards []Card
}

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

func (board *Board) getCardByID(id int) *Card {
	for _, boardCard := range board.cards {
		if boardCard.ID == id {
			return &boardCard
		}
	}
	return nil
}

func (board *Board) replace(oldCards []Card, newCards []Card) {
	for i, oldCard := range oldCards {
		board.replaceCard(oldCard, newCards[i])
	}
}

func (board *Board) replaceCard(oldCard Card, newCard Card) {
	for i, boardCard := range board.cards {
		if boardCard == oldCard {
			board.cards[i] = newCard
			return
		}
	}
}

func (board *Board) remove(oldCards []Card) {
	for _, oldCard := range oldCards {
		board.removeCard(oldCard)
	}
}

func (board *Board) removeCard(oldCard Card) {
	cards := board.cards
	for i, boardCard := range cards {
		if boardCard == oldCard {
			board.cards = append(cards[:i], cards[i+1:]...)
			return
		}
	}
}

// ContainsSet returns whether there is at least one set on the board
func (board *Board) ContainsSet() bool {
	cards := board.cards
	for i := 0; i < len(cards); i++ {
		for j := i + 1; j < len(cards); j++ {
			for k := j + 1; k < len(cards); k++ {
				if isSet(cards[i], cards[j], cards[k]) {
					log.Println(cards[i], cards[j], cards[k])
					return true
				}
			}
		}
	}
	return false
}
