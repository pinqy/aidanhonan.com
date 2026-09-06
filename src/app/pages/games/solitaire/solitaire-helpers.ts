import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { Card, CardNumber, Deck } from '../common/card-types';
import { sleep } from '../common/helpers';

export enum SolitairePile {
  Deal = 'Deal',
  Ace = 'Ace',
  Game = 'Game',
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

  dealIndex: WritableSignal<number>;
  readonly flipPile: Signal<Card[]>;
  readonly flipPileTopCard: Signal<Card | undefined>;
  readonly flipPileTop3: Signal<Card[]>;
  readonly score_moves: WritableSignal<number> = signal(0);
  autocompleting = false;

  constructor() {
    this.deck = new Deck(false);
    this.dealPile = signal([]);
    this.acePiles = [];
    for (let i = 0; i < 4; i++) this.acePiles.push(signal([]));
    this.gamePiles = [];
    for (let i = 0; i < 7; i++) this.gamePiles.push(signal([]));

    this.acePileTopCards = this.acePiles.map((ap) => {
      return computed(() => ap().length > 0 ? ap()[ap().length-1] : undefined);
    });

    this.gamePileTopCards = this.gamePiles.map((gp) => {
      return computed(() => gp().length > 0 ? gp()[gp().length-1] : undefined);
    });

    this.dealIndex = signal(0);
    this.flipPile = computed(() => this.dealPile().slice(0, this.dealIndex()));
    this.flipPileTopCard = computed(() => this.flipPile().length > 0 ? this.flipPile()[this.flipPile().length-1] : undefined);
    this.flipPileTop3 = computed(() => this.flipPile().slice(this.flipPile().length - Math.min(3, this.dealIndex())));
  }

  new_game(): void {
    this.score_moves.set(0);
    this.autocompleting = false;
    this.deck.shuffle();
    for (const pile of this.acePiles) pile.set([]);
    for (const pile of this.gamePiles) pile.set([]);

    // deal cards to game piles
    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        const card = this.deck.deal_card();
        if (!card) throw new Error('deck misconfigured');
        
        this.gamePiles[j].update((cards) => {
          cards.push(card);
          return cards;
        });

        if (j === i) card.flip();
      }
    }

    // set deal pile to remaining cards
    this.dealIndex.set(0);
    this.dealPile.set(this.deck.get_remaining_cards());
    this.dealPile().forEach(card => card.isRevealed.set(true)); // any cards that are dealt should be revealed
  }

  deal_1(): void {
    this.dealIndex.update((di) => Math.min(di+1, this.dealPile().length));
    this.increment_score();
  }

  deal_3(): void {
    this.dealIndex.update((di) => Math.min(di+3, this.dealPile().length));
    this.increment_score();
  }

  increment_score(): void {
    this.score_moves.update((sm) => sm+1);
  }

  reset_deal(): void {
    this.dealIndex.set(0);
    this.increment_score();
  }

  find_card(pile: SolitairePile, pileIndex: number, pileDepth?: number): Card | undefined {
    switch(pile) {
      case(SolitairePile.Game):
        if (pileDepth === undefined || pileIndex >= this.gamePiles.length || pileDepth > this.gamePiles[pileIndex]().length) return undefined;
        return this.gamePiles[pileIndex]()[this.gamePiles[pileIndex]().length-pileDepth];
      case(SolitairePile.Deal):
        if (pileIndex >= this.dealPile().length) return undefined;
        return this.dealPile()[pileIndex];
      case(SolitairePile.Ace):
        if (pileIndex >= this.acePileTopCards.length || !this.acePileTopCards[pileIndex]()) return undefined;
        return this.acePileTopCards[pileIndex]()!;
    }
  }

  find_move(sourcePileType: SolitairePile, sourcePileIndex: number, sourcePileDepth?: number): SolitaireMove | undefined {
    for (let i = 0; i < this.acePileTopCards.length; i++) {
      // Valid move if ace pile is empty and card is an ace OR
      // pile is same suit and card is one higher than top card
      const move: SolitaireMove = {
        sourcePileType,
        sourcePileIndex,
        sourcePileDepth,
        destinationPileType: SolitairePile.Ace,
        destinationPileIndex: i,
      };
      if (this.is_valid_move(move)) return move;
    }

    for (let i = 0; i < this.gamePileTopCards.length; i++) {
      // Valid move if game pile is empty and card is a king OR
      // pile top card is opposite color and one higher than card
      const move: SolitaireMove = {
        sourcePileType,
        sourcePileIndex,
        sourcePileDepth,
        destinationPileType: SolitairePile.Game,
        destinationPileIndex: i,
      };
      if (this.is_valid_move(move)) return move;
    }

    return undefined;
  }

  execute_move(move: SolitaireMove): boolean { // returns whether any cards actually moved
    if (!this.is_valid_move(move)) return false;

    let srcCards: Card[] = [];

    if (move.sourcePileType === SolitairePile.Game) {
      srcCards = this.gamePiles[move.sourcePileIndex]().slice(-move.sourcePileDepth!);
      this.gamePiles[move.sourcePileIndex].update(pile => pile.slice(0, -move.sourcePileDepth!));
    } else if (move.sourcePileType === SolitairePile.Ace) {
      srcCards = [this.acePileTopCards[move.sourcePileIndex]()!];
      this.acePiles[move.sourcePileIndex].update(pile => pile.slice(0, -1));
    } else if (move.sourcePileType === SolitairePile.Deal) {
      srcCards = [this.dealPile()[move.sourcePileIndex]];
      this.dealPile.update(pile => pile.filter((_, i) => i !== move.sourcePileIndex));
      this.dealIndex.update(di => di > 0 ? di - 1 : 0);
    }

    this.update_moved_pile(move.sourcePileType, move.sourcePileIndex);

    if (move.destinationPileType === SolitairePile.Game) {
      this.gamePiles[move.destinationPileIndex].update(pile => pile.concat(srcCards));
    } else if (move.destinationPileType === SolitairePile.Ace) {
      this.acePiles[move.destinationPileIndex].update(pile => pile.concat(srcCards));
    }

    this.increment_score();
    if (!this.autocompleting && this.can_autocomplete()) {
      this.autocompleting = true;
      this.autocomplete();
    }

    return true;
  }

  private is_valid_move(move: SolitaireMove): boolean {
    const srcCard = this.find_card(move.sourcePileType, move.sourcePileIndex, move.sourcePileDepth);

    if (!srcCard) return false;
    if (move.sourcePileType === SolitairePile.Game && move.destinationPileType === SolitairePile.Ace && move.sourcePileDepth! > 1) return false;

    if (move.destinationPileType === SolitairePile.Game) {
      if (move.destinationPileIndex >= this.gamePileTopCards.length) return false;
      const destCard = this.gamePileTopCards[move.destinationPileIndex]();
      return (!destCard && srcCard.number === CardNumber.King) || (destCard && !destCard.same_color(srcCard) && srcCard.value === destCard.value-1) || false;
    } else if (move.destinationPileType === SolitairePile.Ace) {
      if (move.destinationPileIndex >= this.acePileTopCards.length || move.sourcePileType === SolitairePile.Ace) return false;
      const destCard = this.acePileTopCards[move.destinationPileIndex]();
      return (!destCard && srcCard.number === CardNumber.Ace) || (destCard && srcCard.suit === destCard.suit && srcCard.value === destCard.value+1) || false;
    }

    return false;
  }

  private update_moved_pile(pileType: SolitairePile, pileIndex: number): void {
    let pileLen = 0;
    switch(pileType) {
      case(SolitairePile.Game):
        pileLen = this.gamePiles[pileIndex]().length;
        if (pileLen > 0) this.gamePiles[pileIndex]()[pileLen-1].isRevealed.set(true);
        break;
      case (SolitairePile.Ace):
        pileLen = this.acePiles[pileIndex]().length;
        if (pileLen > 0) this.acePiles[pileIndex]()[pileLen-1].isRevealed.set(true);
        break;
    }
  }

  private can_autocomplete(): boolean {
    // all game piles fully revealed (or empty), no cards left in deal pile
    return this.gamePiles.filter((gp) => gp().length > 0 && !gp()[0].isRevealed()).length === 0 && this.dealPile().length === 0;
  }

  private async autocomplete(): Promise<void> {
    let attempts = 0;
    while (attempts < 52 && this.gamePiles.filter((g) => g().length > 0).length > 0) {
      for (let i = 0; i < this.gamePiles.length; i++) {
        const move = this.find_move(SolitairePile.Game, i, 1);
        if (move) {
          this.execute_move(move);
          await sleep(100);
        }
      };
      attempts += 1;
    }
    this.autocompleting = false;
  }
}
