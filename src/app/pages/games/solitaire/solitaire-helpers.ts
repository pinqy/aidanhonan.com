import { computed, Signal, signal, WritableSignal } from "@angular/core";

export enum CardSuit {
  Clubs = "Clubs",
  Spades = "Spades",
  Diamonds = "Diamonds",
  Hearts = "Hearts",
}

export enum CardNumber {
  Ace = "A",
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Jack = "J",
  Queen = "Q",
  King = "K",
}

export class Card {
  readonly suit: CardSuit;
  readonly number: CardNumber;
  readonly value: number;
  readonly isRevealed: WritableSignal<boolean>;

  constructor(suit: CardSuit, number: CardNumber, value: number) {
    this.suit = suit
    this.number = number
    this.value = value
    this.isRevealed = signal(false)
  }

  color(): string {
    return [CardSuit.Diamonds, CardSuit.Hearts].includes(this.suit) ? "red" : "black"
  }

  same_color(other_card: Card): boolean {
    return this.color() == other_card.color()
  }

  equals(other_card: Card): boolean {
    return this.suit == other_card.suit && this.number == other_card.number && this.value == other_card.value
  }

  flip(): void {
    this.isRevealed.update(r => !r)
  }
}

export class Deck {
  cards: Card[];
  private deal_index: number;

  constructor(ace_high?: boolean) {
    this.cards = Deck.create_deck_cards(ace_high ?? true)
    this.deal_index = 0
  }

  static create_deck_cards(ace_high: boolean): Card[] {
    const deck: Card[] = []

    const numbers = Object.values(CardNumber)
    for (const suit of Object.values(CardSuit)) {
      numbers.forEach((number, index) => {
        const value = (number == CardNumber.Ace && ace_high) ? 14 : index+1
        deck.push(new Card(suit, number, value))
      })
    }
    return deck
  }

  deal_card(): Card | undefined {
    if (this.deal_index >= this.cards.length) return

    const card = this.cards[this.deal_index]
    this.deal_index++
    return card
  }

  get_remaining_cards(): Card[] {
    return this.cards.slice(this.deal_index)
  }

  // Fisher-Yates shuffle algo
  shuffle(): void {
    for (let i = this.cards.length - 1; i >= 1; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    this.deal_index = 0
    for (const card of this.cards) card.isRevealed.set(false)
  }
}

export enum SolitairePile {
  Deal = "Deal",
  Ace = "Ace",
  Game = "Game",
}

export interface SolitaireMove {
  sourcePileType: SolitairePile,
  sourcePileIndex: number,
  sourcePileDepth?: number,
  destinationPileType: SolitairePile,
  destinationPileIndex: number,
}

export class SolitaireGame {
  private deck: Deck;
  readonly dealPile: WritableSignal<Card[]>;
  readonly acePiles: WritableSignal<Card[]>[];
  readonly gamePiles: WritableSignal<Card[]>[];
  private acePileTopCards: Signal<Card | undefined>[];
  private gamePileTopCards: Signal<Card | undefined>[];

  constructor() {
    this.deck = new Deck(false)
    this.dealPile = signal([])
    this.acePiles = []
    for (let i = 0; i < 4; i++) this.acePiles.push(signal([]))
    this.gamePiles = []
    for (let i = 0; i < 7; i++) this.gamePiles.push(signal([]))

    this.acePileTopCards = this.acePiles.map((ap) => {
      return computed(() => ap().length > 0 ? ap()[ap().length-1] : undefined)
    })

    this.gamePileTopCards = this.gamePiles.map((gp) => {
      return computed(() => gp().length > 0 ? gp()[gp().length-1] : undefined)
    })
  }

  new_game() {
    this.deck.shuffle()
    for (const pile of this.acePiles) pile.set([])
    for (const pile of this.gamePiles) pile.set([])

    // deal cards to game piles
    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        const card = this.deck.deal_card()
        if (!card) throw new Error("deck misconfigured")
        
        this.gamePiles[j].update((cards) => {
          cards.push(card)
          return cards
        })

        if (j == i) card.flip()
      }
    }

    // set deal pile to remaining cards
    this.dealPile.set(this.deck.get_remaining_cards())
  }

  find_move(card: Card, sourcePileType: SolitairePile, sourcePileIndex: number, sourcePileDepth?: number): SolitaireMove | undefined {
    if (sourcePileType != SolitairePile.Ace) {
      for (const [index, tc] of this.acePileTopCards.entries()) {
        // Valid move if ace pile is empty and card is an ace OR
        // pile is same suit and card is one higher than top card
        const topCard = tc()
        if ((card.number == CardNumber.Ace && !topCard) || (topCard !== undefined && topCard.suit == card.suit && topCard.value == (card.value-1))) {
          return {
            sourcePileType,
            sourcePileIndex,
            sourcePileDepth,
            destinationPileType: SolitairePile.Ace,
            destinationPileIndex: index,
          }
        }
      }
    }

    for (const [index, tc] of this.gamePileTopCards.entries()) {
      // Valid move if game pile is empty and card is a king OR
      // pile top card is opposite color and one higher than card
      const topCard = tc()
      if ((card.number == CardNumber.King && !topCard) || (topCard !== undefined && !topCard.same_color(card) && topCard.value == (card.value+1))) {
        return {
          sourcePileType,
          sourcePileIndex,
          sourcePileDepth,
          destinationPileType: SolitairePile.Game,
          destinationPileIndex: index,
        }
      }
    }

    return undefined
  }

  execute_move(move: SolitaireMove): boolean { // returns whether any cards actually moved
    if (!this.is_valid_move(move)) return false

    let srcCards: Card[] = []

    if (move.sourcePileType == SolitairePile.Game) {
      srcCards = this.gamePiles[move.sourcePileIndex]().slice(-move.sourcePileDepth!)
      this.gamePiles[move.sourcePileIndex].update(pile => pile.slice(0, -move.sourcePileDepth!))
    } else if (move.sourcePileType == SolitairePile.Ace) {
      srcCards = [this.acePileTopCards[move.sourcePileIndex]()!]
      this.acePiles[move.sourcePileIndex].update(pile => pile.slice(0, -1))
    } else if (move.sourcePileType == SolitairePile.Deal) {
      srcCards = [this.dealPile()[move.sourcePileIndex]]
      this.dealPile.update(pile => pile.filter((_, i) => i != move.sourcePileIndex))
    }

    this.update_moved_pile(move.sourcePileType, move.sourcePileIndex)

    if (move.destinationPileType == SolitairePile.Game) {
      this.gamePiles[move.destinationPileIndex].update(pile => pile.concat(srcCards))
    } else if (move.destinationPileType == SolitairePile.Ace) {
      this.acePiles[move.destinationPileIndex].update(pile => pile.concat(srcCards))
    }

    return true
  }

  private is_valid_move(move: SolitaireMove): boolean {
    let srcCard: Card;
    switch(move.sourcePileType) {
      case(SolitairePile.Game):
        if (move.sourcePileDepth === undefined || (move.destinationPileType == SolitairePile.Ace && move.sourcePileDepth > 1)) return false
        if (move.sourcePileIndex >= this.gamePiles.length || move.sourcePileDepth > this.gamePiles[move.sourcePileIndex]().length) return false
        srcCard = this.gamePiles[move.sourcePileIndex]()[this.gamePiles[move.sourcePileIndex]().length-move.sourcePileDepth]
        break
      case(SolitairePile.Deal):
        if (move.sourcePileIndex >= this.dealPile().length) return false
        srcCard = this.dealPile()[move.sourcePileIndex]
        break
      case(SolitairePile.Ace):
        if (move.sourcePileIndex >= this.acePileTopCards.length || !this.acePileTopCards[move.sourcePileIndex]()) return false
        srcCard = this.acePileTopCards[move.sourcePileIndex]()!
        break
      default:
        return false
    }

    if (move.destinationPileType == SolitairePile.Game) {
      if (move.destinationPileIndex >= this.gamePileTopCards.length) return false
      const destCard = this.gamePileTopCards[move.destinationPileIndex]()
      return (!destCard && srcCard.number == CardNumber.King) || (destCard && !destCard.same_color(srcCard) && srcCard.value == destCard.value-1) || false
    } else if (move.destinationPileType == SolitairePile.Ace) {
      if (move.destinationPileIndex >= this.acePileTopCards.length || move.sourcePileType == SolitairePile.Ace) return false
      const destCard = this.acePileTopCards[move.destinationPileIndex]()
      return (!destCard && srcCard.number == CardNumber.Ace) || (destCard && srcCard.suit == destCard.suit && srcCard.value == destCard.value+1) || false
    }

    return false
  }

  private update_moved_pile(pileType: SolitairePile, pileIndex: number): void {
    let pileLen = 0
    switch(pileType) {
      case(SolitairePile.Game):
        pileLen= this.gamePiles[pileIndex]().length
        if (pileLen > 0) this.gamePiles[pileIndex]()[pileLen-1].isRevealed.set(true)
        break
      case (SolitairePile.Ace):
        pileLen = this.acePiles[pileIndex]().length
        if (pileLen > 0) this.acePiles[pileIndex]()[pileLen-1].isRevealed.set(true)
        break
      case (SolitairePile.Deal):
        // TODO
        break
    }
  }
}
