import { Component, input, InputSignal } from '@angular/core';
import { Card } from '../card-types';

@Component({
  selector: 'app-playing-card',
  imports: [],
  template: `
    <div class="card-content" [class]="get_card_classes()">
      @if (card() !== undefined && card()!.isRevealed()) {
        {{card()!.number}} {{card()!.suit}}
      }
      @else {AH}
    </div>
  `,
  styleUrl: './playing-card.scss',
})
export class PlayingCard {
  card: InputSignal<Card | undefined> = input()

  get_card_classes(): string {
    const classes = []
    if (!this.card() || !this.card()!.isRevealed()) {
      classes.push("card-hidden")
    } else {
      classes.push("card-revealed")
      if (this.card()!.color() == "red") classes.push("card-red")
      else classes.push("card-black")
    }

    return classes.join(" ")
  }
}
