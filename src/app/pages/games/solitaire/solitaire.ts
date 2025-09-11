import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Deck } from './solitaire-helpers';

@Component({
  selector: 'app-solitaire',
  imports: [],
  templateUrl: './solitaire.html',
  styleUrl: './solitaire.scss'
})
export class Solitaire {
  // page navigation
  private readonly router = inject(Router)

  returnToGamesMenu() {
    this.router.navigate(["/games"])
  }

  // Game state
  deck = new Deck(false)

  new_game() {
    this.deck.shuffle()
  }
}
