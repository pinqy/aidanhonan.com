import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { MinesweeperDifficulty, MinesweeperSquare } from './minesweeper-constants';

@Component({
  selector: 'app-minesweeper',
  standalone: true,
  imports: [],
  templateUrl: './minesweeper.component.html',
  styleUrl: './minesweeper.component.scss'
})
export class MinesweeperComponent {
  private readonly router = inject(Router)

  returnToGamesMenu() {
    this.router.navigate(["/games"])
  }

  /**
   * Minesweeper Game Logic
   * 
   * TODO: Add "Custom" difficulty
   * TODO: First click always "0" space
   */

  // start with intermediate board by default
  difficulty: MinesweeperDifficulty = MinesweeperDifficulty.Intermediate
  tiles_x!: number
  tiles_y!: number
  num_bombs!: number

  board: MinesweeperSquare[][] = []
  num_flags: WritableSignal<number> = signal(0)
  remaining_num_tiles!: WritableSignal<number>
  game_over: WritableSignal<boolean> = signal(false)
  game_won: Signal<boolean> = computed(() => this.game_over() && this.remaining_num_tiles() == 0)
  game_lost: Signal<boolean> = computed(() => this.game_over() && this.remaining_num_tiles() > 0)
  losing_bomb_id = ""

  mouse_down_in_game: WritableSignal<boolean> = signal(false)

  constructor() {
    this.tiles_x = 16
    this.tiles_y = 16
    this.num_bombs = 40
    this.remaining_num_tiles = signal(this.tiles_x * this.tiles_y - this.num_bombs)

    this.new_game()

    // this accounts for holding mouse down on a tile, dragging off game, and
    // releasing. Without this we would treat it as a mouse down during (mouseenter)
    document.addEventListener("mouseup", () => {this.mouse_down_in_game.set(false)})
  }

  // used to hide right-click menu in game window
  suppress_context_menu(event: Event) {
    event.preventDefault()
  }

  new_game(): void {
    // create new board
    const new_board: MinesweeperSquare[][] = []
    for (let i = 0; i < this.tiles_x; i++) {
      new_board.push([])
      for (let j = 0; j < this.tiles_y; j++) {
        new_board[i].push({
          isBomb: false,
          isFlagged: signal(false),
          isQuestioned: signal(false),
          isOpen: signal(false),
          isPressed: signal(false),
          number: 0,
          id: `${i}_${j}`,
        });
      }
    }

    // set bomb positions
    for (let i = 0; i < this.num_bombs; i++) {
      let b_x = 0
      let b_y = 0

      // generate new bomb positions until finding a unique spot 
      do {
        b_x = Math.floor(Math.random() * this.tiles_x)
        b_y = Math.floor(Math.random() * this.tiles_y)
      } while (new_board[b_x][b_y].isBomb)

      new_board[b_x][b_y].isBomb = true
    }

    // calculate number values
    for (let i = 0; i < this.tiles_x; i++) {
      for (let j = 0; j < this.tiles_y; j++) {
        let bomb_ct = 0

        if (new_board[i][j].isBomb) continue

        if (i > 0) {
          bomb_ct += new_board[i-1][j].isBomb ? 1 : 0 // left
          if (j > 0) bomb_ct += new_board[i-1][j-1].isBomb ? 1 : 0 // top left
          if (j < this.tiles_y-1) bomb_ct += new_board[i-1][j+1].isBomb ? 1 : 0 // bottom left
        }
        if (j > 0) bomb_ct += new_board[i][j-1].isBomb ? 1 : 0 // top
        if (j < this.tiles_y-1) bomb_ct += new_board[i][j+1].isBomb ? 1 : 0 // bottom
        if (i < this.tiles_x-1) {
          bomb_ct += new_board[i+1][j].isBomb ? 1 : 0 // right
          if (j > 0) bomb_ct += new_board[i+1][j-1].isBomb ? 1 : 0 // top right
          if (j < this.tiles_y-1) bomb_ct += new_board[i+1][j+1].isBomb ? 1 : 0 // bottom right
        }

        new_board[i][j].number = bomb_ct
      }
    }

    // reset game state
    this.game_over.set(false)
    this.num_flags.set(0)
    this.losing_bomb_id = ""
    this.remaining_num_tiles.set(this.tiles_x * this.tiles_y - this.num_bombs)
    this.board = new_board
  }

  change_difficulty(difficulty: MinesweeperDifficulty): void {
    switch (difficulty) {
      case MinesweeperDifficulty.Beginner:
        this.tiles_x = 9
        this.tiles_y = 9
        this.num_bombs = 10
        break
      case MinesweeperDifficulty.Intermediate:
        this.tiles_x = 16
        this.tiles_y = 16
        this.num_bombs = 40
        break
      case MinesweeperDifficulty.Expert:
        this.tiles_x = 30
        this.tiles_y = 16
        this.num_bombs = 99
        break
    }
  }

  get_tile_classes(tile: MinesweeperSquare): string {
    const classes = []

    if (tile.isOpen() || (tile.isPressed() && !tile.isFlagged())) {
      classes.push("tile-open")
      if (tile.id == this.losing_bomb_id) classes.push("tile-losing-bomb")
    } else {
      classes.push("tile-closed")
      if (tile.isFlagged()) classes.push("tile-flagged")
      else if (tile.isQuestioned()) classes.push("tile-questioned")
    }

    return classes.join(" ")
  }

  get_number_tile_color(tile: MinesweeperSquare): string {
    if (!tile.isOpen()) return ""

    switch (tile.number) {
      case 1:
        return "blue"
      case 2:
        return "green"
      case 3:
        return "red"
      case 4:
        return "darkblue"
      case 5:
        return "darkred"
      case 6:
        return "darkcyan"
      case 7:
        return "black"
      case 8:
        return "gray"
      default:
        return ""
    }
  }

  press_tile(event: MouseEvent, tile: MinesweeperSquare): void {
    if (this.game_over()) return // disable mouse actions after loss

    if (event.button == 0) { // left click
      tile.isPressed.set(true)
      this.mouse_down_in_game.set(true)
    } else if (event.button == 2) { // right click
      if (tile.isOpen()) return // no-op when open
      
      // Nothing -> Flagged -> Questioned -> Nothing -> ...
      if (tile.isFlagged()) {
        tile.isFlagged.set(false)
        tile.isQuestioned.set(true)
        this.num_flags.update((n) => n-1)
      } else if (tile.isQuestioned()) {
        tile.isQuestioned.set(false)
      } else {
        tile.isFlagged.set(true)
        this.num_flags.update((n) => n+1)
      }
    }
  }

  unpress_tile(tile: MinesweeperSquare): void {
    tile.isPressed.set(false)
  }

  enter_tile(tile: MinesweeperSquare): void {
    if (this.mouse_down_in_game()) {
      tile.isPressed.set(true)
    }
  }

  click_tile(event: MouseEvent, tile: MinesweeperSquare): void {
    if (this.game_over()) return // disable mouse actions after loss
    if (event.button != 0) return // do nothing except on left click

    this.mouse_down_in_game.set(false)
    tile.isPressed.set(false)

    // click only matters if it's on a hidden space
    if (!tile.isOpen()) {
      this.handle_game_click(tile)
    }
  }

  handle_game_click(tile: MinesweeperSquare): void {
    if (tile.isFlagged()) return // can't click on a flagged square

    tile.isOpen.set(true)

    if (tile.isBomb) {
      this.handle_loss(tile)
      return
    }

    if (tile.number == 0) {
      // open all bordering number tiles
      this.open_surrounding_tiles(tile.id)
    }

    this.remaining_num_tiles.update((n) => n-1)
    if (this.remaining_num_tiles() == 0) this.handle_win()
  }

  open_surrounding_tiles(tile_id: string): void {
    const coords = tile_id.split("_")
    const x = +coords[0]
    const y = +coords[1]

    if (x > 0) {
      this.process_open_surrounding_tile(this.board[x-1][y]) // left
      if (y > 0) this.process_open_surrounding_tile(this.board[x-1][y-1]) // top left
      if (y < this.tiles_y-1) this.process_open_surrounding_tile(this.board[x-1][y+1]) // bottom left
    }
    if (y > 0) this.process_open_surrounding_tile(this.board[x][y-1]) // top
    if (y < this.tiles_y-1) this.process_open_surrounding_tile(this.board[x][y+1]) // bottom
    if (x < this.tiles_x-1) {
      this.process_open_surrounding_tile(this.board[x+1][y]) // right
      if (y > 0) this.process_open_surrounding_tile(this.board[x+1][y-1]) // top right
      if (y < this.tiles_y-1) this.process_open_surrounding_tile(this.board[x+1][y+1]) // bottom right
    }
  }

  process_open_surrounding_tile(tile: MinesweeperSquare): void {
    // skip tiles that have already been processed or are flagged
    if (tile.isOpen() || tile.isFlagged()) return
    tile.isOpen.set(true) // open current tile
    this.remaining_num_tiles.update((n) => n-1)
    if (tile.number == 0) this.open_surrounding_tiles(tile.id) // recursively open surrounding "0" tiles
  }

  handle_loss(tile: MinesweeperSquare): void {
    this.losing_bomb_id = tile.id
    this.game_over.set(true)

    for (const column of this.board) {
      for (const tile of column) {
        if (tile.isBomb && !tile.isFlagged()) tile.isOpen.set(true)
        else if (tile.isFlagged() && !tile.isBomb) tile.isOpen.set(true) // incorrect flag
      }
    }
  }

  handle_win(): void {
    for (const column of this.board) {
      for (const tile of column) {
        if (tile.isBomb && !tile.isFlagged()) tile.isFlagged.set(true) // flag all bombs on win
      }
    }

    this.game_over.set(true)
  }
}