import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { SolitaireGame, SolitairePile } from './solitaire-helpers';
import { Card } from '../common/card-types';
import { PlayingCard } from '../common/playing-card/playing-card';

@Component({
  selector: 'app-solitaire',
  imports: [PlayingCard],
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
   * - Card Designs
   * - Drag cards
   * - Game autocomplete
   * - Save settings
   */

  // Game state
  game: SolitaireGame
  flipPileDisplayCards: Signal<Card[]>
  
  // Settings
  setting_flip_1: WritableSignal<boolean> = signal(false)
  setting_flip_3: Signal<boolean> = computed(() => !this.setting_flip_1())

  constructor() {
    this.game = new SolitaireGame()
    this.new_game()
    this.flipPileDisplayCards = computed(() => this.setting_flip_3() ? this.game.flipPileTop3() : (this.game.flipPileTopCard() ? [this.game.flipPileTopCard()!] : []))
  }

  new_game(): void {
    this.game.new_game()
  }

  select_flip_1(): void {
    if (this.setting_flip_1()) return
    this.setting_flip_1.set(true)
  }

  select_flip_3(): void {
    if (this.setting_flip_3()) return
    this.setting_flip_1.set(false)
  }

  handle_deck_click(): void {
    if (this.setting_flip_1()) {
      this.game.deal_1()
    } else {
      this.game.deal_3()
    }
  }

  handle_deal_pile_click(card: Card): void {
    // in flip 3 mode, only allow click of top card
    if (!this.game.flipPileTopCard() || !card.equals(this.game.flipPileTopCard()!)) return

    const move = this.game.find_move(SolitairePile.Deal, this.game.dealIndex()-1) // deal index tracks next card to flip
    if (!move) return
    this.game.execute_move(move)
  }

  reset_deck(): void {
    this.game.reset_deal()
  }

  handle_game_pile_click(card: Card, pileIndex: number, cardIndex: number): void {
    if (!card.isRevealed()) return

    const cardDepth = this.game.gamePiles[pileIndex]().length - cardIndex // depth = number of cards selected [1, len(pile)]
    const move = this.game.find_move(SolitairePile.Game, pileIndex, cardDepth)
    if (!move) return
    this.game.execute_move(move)
  }

  handle_ace_pile_click(pileIndex: number): void {
    const move = this.game.find_move(SolitairePile.Ace, pileIndex)
    if (!move) return
    this.game.execute_move(move)
  }

  get_game_pile_card_offset(game_pile: Card[]): number {
    return Math.min(15, 160 / (game_pile.length > 1 ? game_pile.length : 1));
  }
}
