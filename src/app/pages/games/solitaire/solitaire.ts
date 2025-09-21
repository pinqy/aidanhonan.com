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

  // Card Dragging State
  dragging_pile: WritableSignal<SolitairePile | undefined> = signal(undefined)
  dragging_index: WritableSignal<number> = signal(-1)
  dragging_depth: WritableSignal<number> = signal(-1)
  dragging_card: Signal<Card | undefined> = computed(() => this.find_movable_card(this.dragging_pile(), this.dragging_index(), this.dragging_depth()))
  has_moved_since_click: WritableSignal<boolean> = signal(false)
  is_dragging: Signal<boolean> = computed(() => this.dragging_card() !== undefined)
  dragging_mouse_x0 = 0
  dragging_mouse_y0 = 0
  dragging_mouse_x: WritableSignal<number> = signal(0)
  dragging_mouse_y: WritableSignal<number> = signal(0)
  dragging_card_offset_x: Signal<number> = computed(() => this.dragging_mouse_x() - this.dragging_mouse_x0)
  dragging_card_offset_y: Signal<number> = computed(() => this.dragging_mouse_y() - this.dragging_mouse_y0)
  is_over_card: WritableSignal<boolean> = signal(false)

  constructor() {
    this.game = new SolitaireGame()
    this.new_game()
    this.flipPileDisplayCards = computed(() => this.setting_flip_3() ? this.game.flipPileTop3() : (this.game.flipPileTopCard() ? [this.game.flipPileTopCard()!] : []))

    // Initialize card dragging vars
    this.dragging_card = computed(() => this.find_movable_card(this.dragging_pile(), this.dragging_index(), this.dragging_depth()))
    this.is_dragging = computed(() => this.dragging_card() !== undefined)
    document.addEventListener("mousemove", (event) => this.handle_card_drag(event))
    document.addEventListener("mouseup", () => this.handle_window_mouseup())
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
    if (this.has_moved_since_click() || !this.game.flipPileTopCard() || !card.equals(this.game.flipPileTopCard()!)) return

    const move = this.game.find_move(SolitairePile.Deal, this.game.dealIndex()-1) // deal index tracks next card to flip
    if (!move) return
    this.game.execute_move(move)
  }

  reset_deck(): void {
    this.game.reset_deal()
  }

  handle_game_pile_click(card: Card, pileIndex: number, cardIndex: number): void {
    if (this.has_moved_since_click() || !card.isRevealed()) return

    const cardDepth = this.game.gamePiles[pileIndex]().length - cardIndex // depth = number of cards selected [1, len(pile)]
    const move = this.game.find_move(SolitairePile.Game, pileIndex, cardDepth)
    if (!move) return
    this.game.execute_move(move)
  }

  handle_ace_pile_click(pileIndex: number): void {
    if (this.has_moved_since_click()) return

    const move = this.game.find_move(SolitairePile.Ace, pileIndex)
    if (!move) return
    this.game.execute_move(move)
  }

  get_game_pile_card_offset(game_pile: Card[]): number {
    return Math.min(15, 160 / (game_pile.length > 1 ? game_pile.length : 1));
  }

  /**
   * Functions for handling card dragging
   */
  find_movable_card(pile: SolitairePile | undefined, pile_index: number, pile_depth?: number): Card | undefined {
    if (!pile || pile_index < 0) return undefined
    const card = this.game.find_card(pile, pile_index, pile_depth)
    if (!card) return undefined

    // validate card is movable
    switch (pile) {
      case (SolitairePile.Deal):
        if (!this.game.flipPileTopCard() || !card.equals(this.game.flipPileTopCard()!)) return undefined
        break
      case (SolitairePile.Game):
        if (!card.isRevealed()) return undefined
        break
    }

    return card
  }

  enter_card(): void {
    this.is_over_card.set(true)
  }

  leave_card(): void {
    this.is_over_card.set(false)
  }

  handle_deal_pile_mousedown(event: MouseEvent): void {
    this.dragging_pile.set(SolitairePile.Deal)
    this.dragging_index.set(this.game.dealIndex()-1)
    this.dragging_mouse_x0 = event.clientX
    this.dragging_mouse_y0 = event.clientY
    this.dragging_mouse_x.set(event.clientX)
    this.dragging_mouse_y.set(event.clientY)
  }

  handle_game_pile_mousedown(event: MouseEvent, pileIndex: number, cardIndex: number): void {
    const cardDepth = this.game.gamePiles[pileIndex]().length - cardIndex
    this.dragging_pile.set(SolitairePile.Game)
    this.dragging_index.set(pileIndex)
    this.dragging_depth.set(cardDepth)
    this.dragging_mouse_x0 = event.clientX
    this.dragging_mouse_y0 = event.clientY
    this.dragging_mouse_x.set(event.clientX)
    this.dragging_mouse_y.set(event.clientY)
  }

  handle_ace_pile_mousedown(event: MouseEvent, pileIndex: number): void {
    this.dragging_pile.set(SolitairePile.Ace)
    this.dragging_index.set(pileIndex)
    this.dragging_mouse_x0 = event.clientX
    this.dragging_mouse_y0 = event.clientY
    this.dragging_mouse_x.set(event.clientX)
    this.dragging_mouse_y.set(event.clientY)
  }

  handle_card_drag(event: MouseEvent): void {
    if (this.is_dragging()) {
      this.has_moved_since_click.set(true)
      this.dragging_mouse_x.set(event.clientX)
      this.dragging_mouse_y.set(event.clientY)
    }
  }

  handle_game_pile_mouseup(pileIndex: number): void {
    if (this.is_dragging()) {
      this.game.execute_move({
        sourcePileType: this.dragging_pile()!,
        sourcePileIndex: this.dragging_index(),
        sourcePileDepth: this.dragging_depth(),
        destinationPileType: SolitairePile.Game,
        destinationPileIndex: pileIndex,
      })
      this.end_drag()
    }
  }

  handle_ace_pile_mouseup(pileIndex: number): void {
    if (this.is_dragging()) {
      this.game.execute_move({
        sourcePileType: this.dragging_pile()!,
        sourcePileIndex: this.dragging_index(),
        sourcePileDepth: this.dragging_depth(),
        destinationPileType: SolitairePile.Ace,
        destinationPileIndex: pileIndex,
      })
      this.end_drag()
    }
  }

  handle_window_mouseup() {
    if (this.is_dragging() && !this.is_over_card()) {
      this.end_drag()
    }
  }

  end_drag(): void {
    this.dragging_mouse_x0 = 0
    this.dragging_mouse_y0 = 0
    this.dragging_mouse_x.set(0)
    this.dragging_mouse_y.set(0)

    this.dragging_pile.set(undefined)
    this.dragging_index.set(-1)
    this.dragging_depth.set(-1)

    this.has_moved_since_click.set(false)
  }
}
