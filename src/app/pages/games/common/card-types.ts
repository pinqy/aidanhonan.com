import { signal, WritableSignal } from "@angular/core";

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