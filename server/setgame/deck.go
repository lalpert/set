package setgame

import (
	"math/rand"
)

// Deck is a list of cards
type Deck struct {
	cards []Card
}

func createShuffledDeck() Deck {
	var deck = Deck{}
	id := 0
	for _, color := range colors {
		for _, shape := range shapes {
			for _, fill := range fills {
				for _, number := range numbers {
					c := Card{color, shape, fill, number, id}
					id++
					deck.cards = append(deck.cards, c)
				}
			}
		}
	}
	deck.shuffle()
	return deck
}

//shuffle shuffles the cards in the deck
func (d Deck) shuffle() {
	deck := d.cards
	for i := 1; i < len(deck); i++ {
		r := rand.Intn(i + 1)
		if i != r {
			deck[r], deck[i] = deck[i], deck[r]
		}
	}
}

// Pops a card from the deck and returns the card
func (d Deck) getNextCard() Card {
	deck := d.cards
	nextCard, newDeck := deck[len(deck)-1], deck[:len(deck)-1]
	d.cards = newDeck
	return nextCard
}

func (d Deck) deal(numCards int) []Card {
	newCards := []Card{}
	for i := 0; i < numCards; i++ {
		nextCard := d.getNextCard()
		newCards = append(newCards, nextCard)
	}
	return newCards
}
