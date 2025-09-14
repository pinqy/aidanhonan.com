import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Card, SolitaireGame, SolitairePile } from './solitaire-helpers';

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
   * - Implement/render dealing
   * - Drag cards
   * - Game autocomplete
   * - Save settings
   */

  // Game state
  game: SolitaireGame

  constructor() {
    this.game = new SolitaireGame()
    this.new_game()
  }

  new_game() {
    this.game.new_game()
  }

  get_card_classes(card: Card): string {
    if (!card) return "" // safety check for weird behavior of moving cards

    const classes = []
    if (!card.isRevealed()) {
      classes.push("solitaire-card-hidden")
    } else {
      if (card.color() == "red") classes.push("solitaire-card-red")
      else classes.push("solitaire-card-black")
    }

    return classes.join(" ")
  }

  handle_deck_click(): void {
    this.game.deal_3()
  }

  handle_deal_pile_click(card: Card): void {
    // in flip 3 mode, only allow click of top card
    if (!this.game.flipPileTopCard() || !card.equals(this.game.flipPileTopCard()!)) return

    const move = this.game.find_move(card, SolitairePile.Deal, this.game.dealIndex()-1) // deal index tracks next card to flip
    if (!move) return
    this.game.execute_move(move)
  }

  reset_deck(): void {
    this.game.reset_deal()
  }

  handle_game_pile_click(card: Card, pileIndex: number, cardIndex: number): void {
    if (!card.isRevealed()) return

    const cardDepth = this.game.gamePiles[pileIndex]().length - cardIndex // depth = number of cards selected [1, len(pile)]
    const move = this.game.find_move(card, SolitairePile.Game, pileIndex, cardDepth)
    if (!move) return
    this.game.execute_move(move)
  }

  handle_ace_pile_click(card: Card, pileIndex: number): void {
    const move = this.game.find_move(card, SolitairePile.Ace, pileIndex)
    if (!move) return
    this.game.execute_move(move)
  }
}
