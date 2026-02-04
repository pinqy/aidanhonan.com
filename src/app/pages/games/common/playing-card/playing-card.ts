import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { Card, CardSuit } from '../card-types';

@Component({
  selector: 'app-playing-card',
  imports: [],
  template: `
    <div class="card-content" [class]="get_card_classes()">
      @if (cardRevealed()) {
        <div class="card-top">
          <span class="card-number">{{cardNum()}}</span>
          <span class="card-suit" [innerHTML]="cardSuit()"></span>
        </div>
        <div class="card-center" [innerHTML]="cardSuit()"></div>
        <div class="card-bottom">
          <span class="card-number">{{cardNum()}}</span>
          <span class="card-suit" [innerHTML]="cardSuit()"></span>
        </div>
      }
      @else {AH}
    </div>
  `,
  styleUrl: './playing-card.scss',
})
export class PlayingCard {
  card: InputSignal<Card | undefined> = input();
  cardNum: Signal<string> = computed(() => this.card()?.number ?? "");
  cardSuit: Signal<string> = computed(() => this.get_suit_symbol(this.card()?.suit));
  cardRevealed: Signal<boolean> = computed(() => this.card() !== undefined && this.card()!.isRevealed());

  get_card_classes(): string {
    const classes = [];
    if (!this.card() || !this.card()!.isRevealed()) {
      classes.push("card-hidden");
    } else {
      classes.push("card-revealed");
      if (this.card()!.color() === "red") classes.push("card-red");
      else classes.push("card-black");
    }

    return classes.join(" ");
  }

  get_suit_symbol(suit: CardSuit | undefined): string {
    switch (suit) {
      case (CardSuit.Spades):
        return "&#9824;";
      case (CardSuit.Clubs):
        return "&#9827;";
      case (CardSuit.Hearts):
        return "&#9829;";
      case (CardSuit.Diamonds):
        return "&#9830;";
      default:
        return "";
    }
  }
}
