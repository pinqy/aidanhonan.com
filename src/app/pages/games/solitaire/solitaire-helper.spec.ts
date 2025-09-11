import { Card, CardNumber, CardSuit, Deck } from "./solitaire-helpers"

describe('Card', () => {
  let redCard: Card
  let blackCard: Card

  beforeEach(() => {
    redCard = new Card(CardSuit.Diamonds, CardNumber.Ace, 14, true);
    blackCard = new Card(CardSuit.Clubs, CardNumber.Eight, 8, false);
  })

  it('creates with expected values', () => {
    expect(redCard.suit).toEqual(CardSuit.Diamonds)
    expect(redCard.number).toEqual(CardNumber.Ace)
    expect(redCard.value).toEqual(14)
    expect(redCard.isRevealed()).toEqual(true)
    expect(redCard.color()).toEqual("red")

    expect(blackCard.suit).toEqual(CardSuit.Clubs)
    expect(blackCard.number).toEqual(CardNumber.Eight)
    expect(blackCard.value).toEqual(8)
    expect(blackCard.isRevealed()).toEqual(false)
    expect(blackCard.color()).toEqual("black")
  })

  it('same_color comparison works', () => {
    const redCard2 = new Card(CardSuit.Hearts, CardNumber.Five, 5, false)
    const blackCard2 = new Card(CardSuit.Spades, CardNumber.King, 13, true)

    expect(redCard.same_color(redCard2)).toEqual(true)
    expect(blackCard.same_color(blackCard2)).toEqual(true)
    expect(redCard.same_color(blackCard2)).toEqual(false)
    expect(blackCard.same_color(redCard2)).toEqual(false)
  })

  it('flip works', () => {
    expect(redCard.isRevealed()).toEqual(true)
    redCard.flip()
    expect(redCard.isRevealed()).toEqual(false)
    redCard.flip()
    expect(redCard.isRevealed()).toEqual(true)
  })
})

describe('Deck', () => {
  let deck: Deck

  beforeEach(() => {
    deck = new Deck(true)
  })

  it('constructs with expected values', () => {
    expect(deck.cards.length).toEqual(52)

    let ct_spades = 0
    let ct_clubs = 0
    let ct_hearts = 0
    let ct_diamonds = 0
    let total_value = 0
    deck.cards.forEach((card) => {
      ct_spades += card.suit == CardSuit.Spades ? 1 : 0
      ct_clubs += card.suit == CardSuit.Clubs ? 1 : 0
      ct_hearts += card.suit == CardSuit.Hearts ? 1 : 0
      ct_diamonds += card.suit == CardSuit.Diamonds ? 1 : 0
      total_value += card.value
    })

    expect(ct_spades).toEqual(13)
    expect(ct_clubs).toEqual(13)
    expect(ct_hearts).toEqual(13)
    expect(ct_diamonds).toEqual(13)
    expect(total_value).toEqual(416) // expected total card value of Ace-high deck
  })

  it('ace_high sets card values correctly', () => {
    const deckAceLow = new Deck(false)

    const highAces = deck.cards.filter(c => c.number == CardNumber.Ace)
    const lowAces = deckAceLow.cards.filter(c => c.number == CardNumber.Ace)

    highAces.forEach((ace) => expect(ace.value).toEqual(14))
    lowAces.forEach((ace) => expect(ace.value).toEqual(1))
  })

  it('shuffle works', () => {
    // Shuffle deck 5 times and make sure <20 cards are in the same place
    for (let i = 0; i < 5; i++) {
      const deck_copy: Card[] = []
      deck.cards.forEach(card => deck_copy.push(Object.assign({}, card))) // deep copy of card arrangement
      deck.shuffle()

      let same = 0
      deck.cards.forEach((card, index) => {
        if (card.number == deck_copy[index].number && card.suit == deck_copy[index].suit) same++
      })

      expect(same).toBeLessThan(20)
    }
  })
})