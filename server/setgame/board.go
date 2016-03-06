package setgame

// Board is the list of cards currently on the board.
type Board []Card

func (board Board) containsCards(cards []Card) bool {
    for  _, card := range board  {
        if !board.containsCard(card) {
            return false;
        }
    }
    return true
}

func (board Board) containsCard(card Card) bool {
    for  _, boardCard := range board  {
        if boardCard == card {
            return true;
        }
    }
    return false;
}

func (board Board) replace(oldCards []Card, newCards []Card)  {
    for i, oldCard := range oldCards {
        board.replaceCard(oldCard, newCards[i])
    }
}   

func (board Board) replaceCard(oldCard Card, newCard Card) {
     for  i, boardCard := range board  {
        if boardCard == oldCard {
            board[i] = newCard
            return
        }
     }
}

    