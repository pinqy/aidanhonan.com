import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { MinesweeperDifficulty, MinesweeperMenu, MinesweeperMenuContent, MinesweeperSquare } from './minesweeper-constants';

@Component({
  selector: 'app-minesweeper',
  standalone: true,
  imports: [],
  templateUrl: './minesweeper.component.html',
  styleUrl: './minesweeper.component.scss'
})
export class MinesweeperComponent {
  // page navigation
  private readonly router = inject(Router)

  returnToGamesMenu() {
    this.router.navigate(["/games"])
  }

  /**
   * TODO: Add "Custom" difficulty
   * TODO: First click always "0" space
   * TODO: Add icons: bomb, flag, reset-button faces
   * TODO: Add timer
   */

  // Menu state variables
  menu_buttons = [MinesweeperMenu.Game, MinesweeperMenu.Options, MinesweeperMenu.Help]
  selected_menu: WritableSignal<MinesweeperMenu> = signal(MinesweeperMenu.None)
  menu_open: Signal<boolean> = computed(() => this.selected_menu() != MinesweeperMenu.None)
  menu_content!: Record<MinesweeperMenu, MinesweeperMenuContent>

  // Menu settings options
  setting_opening_move: WritableSignal<boolean> = signal(true)
  setting_question_marks: WritableSignal<boolean> = signal(true)
  setting_area_open: WritableSignal<boolean> = signal(true)
  setting_open_remaining: WritableSignal<boolean> = signal(false)

  // Board definition variables
  board: MinesweeperSquare[][] = []
  selected_difficulty: WritableSignal<MinesweeperDifficulty> = signal(MinesweeperDifficulty.Beginner); // this will be overridden in constructor()
  tiles_x!: number
  tiles_y!: number
  num_bombs!: number

  // Game state variables
  num_flags: WritableSignal<number> = signal(0)
  remaining_num_tiles: WritableSignal<number> = signal(0)
  game_over: WritableSignal<boolean> = signal(false)
  game_won: Signal<boolean> = computed(() => this.game_over() && this.remaining_num_tiles() == 0 && this.losing_bomb_tiles.length == 0)
  game_lost: Signal<boolean> = computed(() => this.game_over() && this.remaining_num_tiles() > 0 && this.losing_bomb_tiles.length > 0)
  losing_bomb_tiles: MinesweeperSquare[] = []

  // Button trackers
  reset_button_pressed: WritableSignal<boolean> = signal(false)
  mouse_down_on_reset: WritableSignal<boolean> = signal(false)
  mouse_down_in_game: WritableSignal<boolean> = signal(false)
  open_remaining_button_enabled!: Signal<boolean>


  constructor() {
    this.set_difficulty(MinesweeperDifficulty.Intermediate)
    this.menu_content = this.get_initial_menu_state()
    this.new_game()

    this.open_remaining_button_enabled = computed(() => {return this.setting_open_remaining() && this.num_bombs == this.num_flags()})

    // this accounts for holding mouse down on a tile, dragging off game, and
    // releasing. Without this we would treat it as a mouse down during (mouseenter)
    document.addEventListener("mouseup", () => {
      this.mouse_down_in_game.set(false)
      this.mouse_down_on_reset.set(false)
    })
  }


  /**
   * Functions for managing game state
   */

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

    this.board = new_board

    // reset game state
    this.game_over.set(false)
    this.num_flags.set(0)
    this.losing_bomb_tiles = []
    this.remaining_num_tiles.set(this.tiles_x * this.tiles_y - this.num_bombs)
    
    // close menu if open
    this.selected_menu.set(MinesweeperMenu.None)
  }

  // initialize game after first click
  initialize_game(first_tile: MinesweeperSquare | undefined): void {
    const coords = first_tile ? first_tile.id.split("_") : "500_500"
    const x0 = +coords[0]
    const y0 = +coords[1]

    // set bomb positions
    for (let i = 0; i < this.num_bombs; i++) {
      let b_x = 0
      let b_y = 0

      // generate new bomb positions until finding a unique spot
      let retry = false
      do {
        b_x = Math.floor(Math.random() * this.tiles_x)
        b_y = Math.floor(Math.random() * this.tiles_y)
        retry = this.board[b_x][b_y].isBomb

        if (this.setting_opening_move()) {
          retry = retry || (Math.abs(b_x - x0) <= 1 && Math.abs(b_y - y0) <= 1)
        }
      } while (retry)

      this.board[b_x][b_y].isBomb = true
    }

    // calculate number values
    for (let i = 0; i < this.tiles_x; i++) {
      for (let j = 0; j < this.tiles_y; j++) {
        const current_tile = this.board[i][j]
        if (current_tile.isBomb) continue

        current_tile.number = this.operate_on_surrounding_tiles(current_tile, (surr_tile: MinesweeperSquare) => {return surr_tile.isBomb ? 1 : 0})
      }
    }
  }

  set_difficulty(difficulty: MinesweeperDifficulty): void {
    // no-op if difficulty is same, don't want to start new game
    if (difficulty == this.selected_difficulty()) return

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

    this.selected_difficulty.set(difficulty)
    this.new_game()
  }

  handle_loss(tile: MinesweeperSquare | undefined): void {
    if (tile) this.losing_bomb_tiles.push(tile)
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
        if (tile.isBomb && !tile.isFlagged()) {
          tile.isFlagged.set(true) // flag all bombs on win
          this.num_flags.update((n) => n+1)
        }
      }
    }

    this.game_over.set(true)
  }


  /** 
   * Dynamic style functions
   */

  // Get classes for single tile based on tile state
  get_tile_classes(tile: MinesweeperSquare): string {
    const classes = []

    if (tile.isOpen() || (tile.isPressed() && !tile.isFlagged())) {
      classes.push("tile-open")
    } else {
      classes.push("tile-closed")
    }

    return classes.join(" ")
  }

  get_tile_content_classes(tile: MinesweeperSquare) {
    const classes = []

    if (tile.isOpen()) {
      if (tile.isBomb || (!tile.isBomb && tile.isFlagged())) classes.push("tile-bomb")
      if (this.losing_bomb_tiles.find((l_tile) => l_tile.id == tile.id)) classes.push("tile-losing-bomb")
    } else {
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

  // used to hide right-click menu in game window
  suppress_context_menu(event: Event) {
    event.preventDefault()
  }

  get_reset_button_classes(): string {
    const classes: string[] = []

    if (this.reset_button_pressed()) classes.push("reset-button-smile") // :) when reset button pressed
    else if (this.game_lost()) classes.push("reset-button-dead") // X( when game lost
    else if (this.game_won()) classes.push("reset-button-cool") // B) when game won
    else if (this.mouse_down_in_game()) classes.push("reset-button-ooh") // :o when mouse pressed on tile
    else classes.push("reset-button-smile") // :) all other times

    if (this.reset_button_pressed()) classes.push("minesweeper-inlay")
    else classes.push("minesweeper-extrude")

    return classes.join(" ")
  }


  /**
   * Functions for handling tile mouse actions
   */

  press_tile(event: MouseEvent, tile: MinesweeperSquare): void {
    if (this.game_over()) return // disable mouse actions after loss

    this.selected_menu.set(MinesweeperMenu.None) // close menu if open

    if (event.button == 0) { // left click
      tile.isPressed.set(true)
      this.mouse_down_in_game.set(true)
    } else if (event.button == 2) { // right click
      if (tile.isOpen()) return // no-op when open
      
      // Nothing -> Flagged (-> Questioned) -> Nothing -> ...
      if (tile.isFlagged()) {
        tile.isFlagged.set(false)
        if (this.setting_question_marks()) tile.isQuestioned.set(true)
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

    // handle click on a closed square
    if (!tile.isOpen()) {
      this.handle_game_click(tile)
    }
    // handle click on an open tile if area-open enabled
    else if (this.setting_area_open()) {
      // if number of flags around this square is correct, open all neighbors
      if (tile.number == this.operate_on_surrounding_tiles(tile, (surr_tile: MinesweeperSquare) => {return surr_tile.isFlagged() ? 1 : 0})) {
        this.open_surrounding_tiles(tile)
        if (this.remaining_num_tiles() == 0) this.handle_win()
      }
    }
  }

  handle_game_click(tile: MinesweeperSquare): void {
    if (tile.isFlagged()) return // can't click on a flagged square

    // if this is first square pressed, initialize game
    if (this.remaining_num_tiles() == this.tiles_x * this.tiles_y - this.num_bombs) this.initialize_game(tile)
      
    tile.isOpen.set(true)

    if (tile.isBomb) {
      this.handle_loss(tile)
      return
    }

    if (tile.number == 0) {
      // open all bordering number tiles
      this.open_surrounding_tiles(tile)
    }

    this.remaining_num_tiles.update((n) => n-1)
    if (this.remaining_num_tiles() == 0) this.handle_win()
  }

  open_surrounding_tiles(tile: MinesweeperSquare): void {
    this.operate_on_surrounding_tiles(tile, (surr_tile: MinesweeperSquare) => {
      this.process_open_surrounding_tile(surr_tile)
      return 0
    })
    if (this.losing_bomb_tiles.length > 0) this.handle_loss(undefined)
  }

  process_open_surrounding_tile(tile: MinesweeperSquare): void {
    // skip tiles that have already been processed or are flagged
    if (tile.isOpen() || tile.isFlagged()) return
    tile.isOpen.set(true) // open current tile
    if (tile.isBomb) { // this is possible with area-open setting
      this.losing_bomb_tiles.push(tile)
      return
    }
    this.remaining_num_tiles.update((n) => n-1)
    if (tile.number == 0) this.open_surrounding_tiles(tile) // recursively open surrounding "0" tiles
  }

  // generic function to operate on all surrounding tiles (number returned is only used in some cases)
  operate_on_surrounding_tiles(target: MinesweeperSquare, operation: (tile: MinesweeperSquare) => number): number {
    const coords = target.id.split("_")
    const x = +coords[0]
    const y = +coords[1]

    let ret = 0

    if (x > 0) {
      ret += operation(this.board[x-1][y]) // left
      if (y > 0) ret += operation(this.board[x-1][y-1]) // top left
      if (y < this.tiles_y-1) ret += operation(this.board[x-1][y+1]) // bottom left
    }
    if (y > 0) ret += operation(this.board[x][y-1]) // top
    if (y < this.tiles_y-1) ret += operation(this.board[x][y+1]) // bottom
    if (x < this.tiles_x-1) {
      ret += operation(this.board[x+1][y]) // right
      if (y > 0) ret += operation(this.board[x+1][y-1]) // top right
      if (y < this.tiles_y-1) ret += operation(this.board[x+1][y+1]) // bottom right
    }

    return ret
  }

  open_remaining_tiles(): void {
    if (!this.open_remaining_button_enabled() && !this.game_over()) return

    // if nothing has been clicked, intialize the game
    if (this.remaining_num_tiles() == this.tiles_x * this.tiles_y - this.num_bombs) this.initialize_game(undefined)

    for (const column of this.board) {
      for (const tile of column) {
        if (!(tile.isBomb && tile.isFlagged()) && !tile.isOpen()) {
          tile.isOpen.set(true)
          if (tile.isBomb) this.losing_bomb_tiles.push(tile)
          else this.remaining_num_tiles.update((n) => n-1)
        }
      }
    }

    if (this.losing_bomb_tiles.length > 0) this.handle_loss(undefined)
    else this.handle_win()
  }


  /**
   * Functions for handling reset button mouse actions
   */

  reset_button_down(event: MouseEvent): void {
    if (event.button != 0) return // do nothing except on left click
    this.mouse_down_on_reset.set(true)
    this.reset_button_pressed.set(true)
  }

  reset_button_up(event: MouseEvent): void {
    if (event.button != 0) return // do nothing except on left click
    if (this.mouse_down_on_reset()) this.new_game()

    this.mouse_down_on_reset.set(false)
    this.reset_button_pressed.set(false)
  }

  reset_button_leave(): void {
    this.reset_button_pressed.set(false)
  }

  reset_button_enter(): void {
    if (this.mouse_down_on_reset()) this.reset_button_pressed.set(true)
  }


  /**
   * Function for handling Menu actions
   */
  handleMenuButtonClick(menu_str: string): void {
    if (this.menu_open()) {
      this.selected_menu.set(MinesweeperMenu.None)
      return
    }

    this.selected_menu.set(menu_str as MinesweeperMenu)
  }

  handleMenuButtonEnter(menu_str: string): void {
    if (this.menu_open() && this.selected_menu() != (menu_str as MinesweeperMenu)) {
      this.selected_menu.set(menu_str as MinesweeperMenu)
    }
  }

  get_menu_class(menu: string): string {
    return `minesweeper-menu-${menu.toLowerCase()}`
  }

  get_initial_menu_state(): Record<MinesweeperMenu, MinesweeperMenuContent> {
    return {
      [MinesweeperMenu.Game]: {
        hasSelectableItems: true,
        sections: [
          [{
            text: "New",
            action: () => {this.new_game()}
          }],
          [
            {
              text: "Beginner",
              isSelected: computed(() => this.selected_difficulty() == MinesweeperDifficulty.Beginner),
              action: () => {this.set_difficulty(MinesweeperDifficulty.Beginner)}
            },
            {
              text: "Intermediate",
              isSelected: computed(() => this.selected_difficulty() == MinesweeperDifficulty.Intermediate),
              action: () => {this.set_difficulty(MinesweeperDifficulty.Intermediate)}
            },
            {
              text: "Expert",
              isSelected: computed(() => this.selected_difficulty() == MinesweeperDifficulty.Expert),
              action: () => {this.set_difficulty(MinesweeperDifficulty.Expert)}
            }
          ],
          [{
            text: "Exit",
            action: () => {this.returnToGamesMenu()}
          }]
        ]
      },
      [MinesweeperMenu.Options]: {
        hasSelectableItems: true,
        sections: [
          [
            {
              text: "Opening Move",
              isSelected: computed(() => this.setting_opening_move()),
              action: () => {this.setting_opening_move.update((b) => !b)},
              hoverText: "The first move will always open a useful series of squares",
            },
            {
              text: "Question Marks",
              isSelected: computed(() => this.setting_question_marks()),
              action: () => {this.setting_question_marks.update((b) => !b)},
              hoverText: "Second right-click changes bomb marking to a question mark",
            },
            {
              text: "Area Open",
              isSelected: computed(() => this.setting_area_open()),
              action: () => {this.setting_area_open.update((b) => !b)},
              hoverText: "Clicking on numbered/satisfied square will open all its neighbors",
            },
            {
              text: "Open Remaining",
              isSelected: computed(() => this.setting_open_remaining()),
              action: () => {this.setting_open_remaining.update((b) => !b)},
              hoverText: "When 0 bombs are left unmarked, click the bomb counter 000 to open all remaining",
            }
          ]
        ]
      },
      [MinesweeperMenu.Help]: {
        hasSelectableItems: false,
        sections: [
          [
            {
              text: "Instructions",
              action: () => {return}, // TODO: implement
            },
          ],
          [
            {
              text: "About",
              action: () => {return}, // TODO: implement
            },
          ]
        ]
      },
      [MinesweeperMenu.None]: {
        hasSelectableItems: false,
        sections: [],
      },
    }
  }
}