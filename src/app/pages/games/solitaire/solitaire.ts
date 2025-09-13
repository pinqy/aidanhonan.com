import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SolitaireGame } from './solitaire-helpers';

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

  /**
   * TODOs
   * - Render game
   * - Click cards
   * - Drag cards
   * - Game autocomplete
   * - Save settings
   */

  // Game state
  game: SolitaireGame

  constructor() {
    this.game = new SolitaireGame()
  }

  new_game() {
    this.game.new_game()
  }


}
