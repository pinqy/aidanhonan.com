import { Component, computed, DestroyRef, inject, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { MinesweeperCookie, MinesweeperDifficulty, MinesweeperMenu, MinesweeperMenuContent, MinesweeperSetting, MinesweeperSquare } from './minesweeper-constants';
import { CookieService } from 'ngx-cookie-service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-minesweeper',
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [CookieService],
  templateUrl: './minesweeper.component.html',
  styleUrl: './minesweeper.component.scss'
})
export class MinesweeperComponent {
  // page navigation
  private readonly router = inject(Router)

  returnToGamesMenu() {
    this.router.navigate(["/games"])
  }

  // cookie service
  private readonly cookieService = inject(CookieService)

  /**
   * TODO: Add instruction/about page
   * maybe: add backend for high scores
   */

  // Menu state variables
  menu_buttons = [MinesweeperMenu.Game, MinesweeperMenu.Options, MinesweeperMenu.Help]
  selected_menu: WritableSignal<MinesweeperMenu> = signal(MinesweeperMenu.None)
  menu_open: Signal<boolean> = computed(() => this.selected_menu() != MinesweeperMenu.None)
  custom_form_open: WritableSignal<boolean> = signal(false)
  menu_content!: Record<MinesweeperMenu, MinesweeperMenuContent>

  // Menu settings options
  setting_opening_move: WritableSignal<boolean> = signal(true)
  setting_question_marks: WritableSignal<boolean> = signal(true)
  setting_area_open: WritableSignal<boolean> = signal(true)
  setting_open_remaining: WritableSignal<boolean> = signal(false)

  // Board definition variables
  board: MinesweeperSquare[][] = []
  selected_difficulty: WritableSignal<MinesweeperDifficulty> = signal(MinesweeperDifficulty.Beginner); // this will be overridden in constructor()
  tiles_x = 9
  tiles_y = 9
  num_bombs = 10

  // Game state variables
  num_flags: WritableSignal<number> = signal(0)
  remaining_bombs: Signal<number> = computed(() => this.num_bombs - this.num_flags())
  remaining_num_tiles: WritableSignal<number> = signal(-1) // -1 is just to signal that the page is loading for the first time
  game_started: WritableSignal<boolean> = signal(false)
  game_over: WritableSignal<boolean> = signal(false)
  game_won: Signal<boolean> = computed(() => this.game_over() && this.remaining_num_tiles() == 0 && this.losing_bomb_tiles.length == 0)
  game_lost: Signal<boolean> = computed(() => this.game_over() && this.remaining_num_tiles() > 0 && this.losing_bomb_tiles.length > 0)
  losing_bomb_tiles: MinesweeperSquare[] = []

  // Button trackers
  reset_button_pressed: WritableSignal<boolean> = signal(false)
  mouse_down_on_reset: WritableSignal<boolean> = signal(false)
  mouse_down_in_game: WritableSignal<boolean> = signal(false)
  open_remaining_button_enabled: Signal<boolean>= computed(() => this.setting_open_remaining() && this.remaining_bombs() == 0 && !this.game_over())

  // Counter signals
  bomb_counter_100s: Signal<string> = computed(() => this.open_remaining_button_enabled() ? "0_alt" : this.get_100s(this.remaining_bombs()))
  bomb_counter_10s: Signal<string> = computed(() => this.open_remaining_button_enabled() ? "0_alt" : this.get_10s(this.remaining_bombs()))
  bomb_counter_1s: Signal<string> = computed(() => this.open_remaining_button_enabled() ? "0_alt" : this.get_1s(this.remaining_bombs()))
  timer_seconds: WritableSignal<number> = signal(0)
  timer_100s: Signal<string> = computed(() => this.get_100s(this.timer_seconds()))
  timer_10s: Signal<string> = computed(() => this.get_10s(this.timer_seconds()))
  timer_1s: Signal<string> = computed(() => this.get_1s(this.timer_seconds()))

  constructor() {
    this.menu_content = this.get_initial_menu_state()
    this.load_settings()

    // this accounts for holding mouse down on a tile, dragging off game, and
    // releasing. Without this we would treat it as a mouse down during (mouseenter)
    document.addEventListener("mouseup", () => {
      this.mouse_down_in_game.set(false)
      this.mouse_down_on_reset.set(false)
    })

    // initialize timer that will "tick" every second and update the game clock
    const timer_obj = setInterval(() => {
      if (this.game_started() && !this.game_over()) {
        this.timer_seconds.update((v) => Math.min(v+1, 999))
      }
    }, 1000)

    const destroy_ref = inject(DestroyRef)
    destroy_ref.onDestroy(() => {clearInterval(timer_obj)})
  }

  /**
   * Load settings from cookies
   */

  load_settings(): void {
    // settings
    if (this.cookieService.get(MinesweeperCookie.OpeningMove) == "false") this.setting_opening_move.set(false)
    if (this.cookieService.get(MinesweeperCookie.QuestionMarks) == "false") this.setting_question_marks.set(false)
    if (this.cookieService.get(MinesweeperCookie.AreaOpen) == "false") this.setting_area_open.set(false)
    if (this.cookieService.get(MinesweeperCookie.OpenRemaining) == "true") this.setting_open_remaining.set(true)
    
    // difficulty
    const saved_diff = this.cookieService.get(MinesweeperCookie.Difficulty)
    if (saved_diff == "") this.set_difficulty(MinesweeperDifficulty.Intermediate)
    else if (MinesweeperDifficulty.Beginner == saved_diff || MinesweeperDifficulty.Intermediate == saved_diff || MinesweeperDifficulty.Expert == saved_diff) {
        this.set_difficulty(saved_diff)
    } else if (saved_diff == MinesweeperDifficulty.Custom) {
        const numRegex = /^\d+$/
        const saved_x = this.cookieService.get(MinesweeperCookie.CustomX)
        const saved_y = this.cookieService.get(MinesweeperCookie.CustomY)
        const saved_bombs = this.cookieService.get(MinesweeperCookie.CustomBombs)
        if (numRegex.test(saved_x) && numRegex.test(saved_y) && numRegex.test(saved_bombs)) {
          this.customDiffForm.controls.customWidth.setValue(Number(saved_x))
          this.customDiffForm.controls.customHeight.setValue(Number(saved_y))
          this.customDiffForm.controls.customBombs.setValue(Number(saved_bombs))
          this.set_difficulty(saved_diff)
        } else {
          this.set_difficulty(MinesweeperDifficulty.Intermediate)
        }
    }
    else {
      this.set_difficulty(MinesweeperDifficulty.Intermediate)
    }
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
    this.timer_seconds.set(0)
    this.game_started.set(false)
    this.game_over.set(false)
    this.num_flags.set(1) // force signal refresh if num_flags is already 0
    this.num_flags.set(0)
    this.losing_bomb_tiles = []
    this.remaining_num_tiles.set(this.tiles_x * this.tiles_y - this.num_bombs)
    
    // close menu if open
    this.close_menu()
  }

  // initialize game after first click
  initialize_game(first_tile: MinesweeperSquare | undefined): void {
    const coords = first_tile ? first_tile.id.split("_") : [500, 500]
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
    // no-op if difficulty is same, don't want to start new game (unless it's the initial page load or custom)
    if (difficulty == this.selected_difficulty() && this.remaining_num_tiles() >= 0 && this.selected_difficulty() != MinesweeperDifficulty.Custom) return

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
      case MinesweeperDifficulty.Custom:
        if (!this.customDiffForm.valid) { // safety check
          this.set_difficulty(MinesweeperDifficulty.Intermediate)
          return
        }
        this.tiles_x = this.customDiffForm.value.customWidth!
        this.tiles_y = this.customDiffForm.value.customHeight!
        this.num_bombs = this.customDiffForm.value.customBombs!
        break
    }

    this.selected_difficulty.set(difficulty)
    this.new_game()

    this.customDiffForm.controls.customWidth.setValue(this.tiles_x)
    this.customDiffForm.controls.customHeight.setValue(this.tiles_y)
    this.customDiffForm.controls.customBombs.setValue(this.num_bombs)

    this.cookieService.set(MinesweeperCookie.Difficulty, difficulty, 7)
    // Save x / y / bombs if custom, delete otherwise
    const expiry = this.selected_difficulty() == MinesweeperDifficulty.Custom ? 7 : -1
    this.cookieService.set(MinesweeperCookie.CustomX, `${this.tiles_x}`, expiry)
    this.cookieService.set(MinesweeperCookie.CustomY, `${this.tiles_y}`, expiry)
    this.cookieService.set(MinesweeperCookie.CustomBombs, `${this.num_bombs}`, expiry)
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
   * Counter functions
   */
  get_100s(n: number): string {
    if (n < 0) return "-"
    else if (n > 999) return "9"
    else return `${Math.floor(n/100)}`
  }

  get_10s(n: number): string {
    if (n < -99 || n > 999) return "9"
    else return `${Math.floor(Math.abs(n%100)/10)}`
  }

  get_1s(n: number): string {
    if (n < -99 || n > 999) return "9"
    else return `${Math.abs(n%10)}`
  }

  /**
   * Functions for handling tile mouse actions
   */

  press_tile(event: MouseEvent, tile: MinesweeperSquare): void {
    if (this.game_over()) return // disable mouse actions after loss

    // close menu if open
    this.close_menu()

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
    if (this.remaining_num_tiles() == this.tiles_x * this.tiles_y - this.num_bombs) {
      this.initialize_game(tile)
      this.game_started.set(true)
    }

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
      this.close_menu()
      return
    }

    this.selected_menu.set(menu_str as MinesweeperMenu)
  }

  handleMenuButtonEnter(menu_str: string): void {
    if (this.menu_open() && this.selected_menu() != (menu_str as MinesweeperMenu)) {
      this.selected_menu.set(menu_str as MinesweeperMenu)
      if (this.selected_menu() != MinesweeperMenu.Game) this.custom_form_open.set(false)
    }
  }

  get_menu_class(menu: string): string {
    return `minesweeper-menu-${menu.toLowerCase()}`
  }

  update_setting(setting: MinesweeperSetting): void {
    // Invert the selected setting + add cookie if non-default, delete cookie if default
    switch(setting) {
      case MinesweeperSetting.OpeningMove:
        this.setting_opening_move.update(s => !s)
        if (!this.setting_opening_move()) this.cookieService.set(MinesweeperCookie.OpeningMove, "false", 7)
        else this.cookieService.delete(MinesweeperCookie.OpeningMove)
        break

      case MinesweeperSetting.QuestionMarks:
        this.setting_question_marks.update(s => !s)
        if (!this.setting_question_marks()) this.cookieService.set(MinesweeperCookie.QuestionMarks, "false", 7)
        else this.cookieService.delete(MinesweeperCookie.QuestionMarks)
        break

      case MinesweeperSetting.AreaOpen:
        this.setting_area_open.update(s => !s)
        if (!this.setting_area_open()) this.cookieService.set(MinesweeperCookie.AreaOpen, "false", 7)
        else this.cookieService.delete(MinesweeperCookie.AreaOpen)
        break

      case MinesweeperSetting.OpenRemaining:
        this.setting_open_remaining.update(s => !s)
        if (this.setting_open_remaining()) this.cookieService.set(MinesweeperCookie.OpenRemaining, "true", 7)
        else this.cookieService.delete(MinesweeperCookie.OpenRemaining)
        break
    }
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
            },
            {
              text: "Custom",
              isSelected: computed(() => this.selected_difficulty() == MinesweeperDifficulty.Custom),
              action: () => {this.custom_form_open.update(b => !b)}
            },
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
              action: () => {this.update_setting(MinesweeperSetting.OpeningMove)},
              hoverText: "The first move will always open a useful series of squares",
            },
            {
              text: "Question Marks",
              isSelected: computed(() => this.setting_question_marks()),
              action: () => {this.update_setting(MinesweeperSetting.QuestionMarks)},
              hoverText: "Second right-click changes bomb marking to a question mark",
            },
            {
              text: "Area Open",
              isSelected: computed(() => this.setting_area_open()),
              action: () => {this.update_setting(MinesweeperSetting.AreaOpen)},
              hoverText: "Clicking on numbered/satisfied square will open all its neighbors",
            },
            {
              text: "Open Remaining",
              isSelected: computed(() => this.setting_open_remaining()),
              action: () => {this.update_setting(MinesweeperSetting.OpenRemaining)},
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

  // Custom difficulty form
  getMaxCustomBombs(control: AbstractControl): number | null {
    const x = control.get('customWidth')
    const y = control.get('customHeight');

    return x && y && x.valid && y.valid && x.value && y.value ? ((x.value-1) * (y.value-1) + 1) : null;
  }

  maxBombsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const maxBombs = this.getMaxCustomBombs(control)
    const bombs = control.get('customBombs');
    return maxBombs && bombs && bombs.value && maxBombs < bombs.value ? {maxBombs: true} : null;
  };

  customDiffForm = new FormGroup({
    customWidth: new FormControl<number>(this.tiles_x, [Validators.required, Validators.min(5), Validators.max(30)]),
    customHeight: new FormControl<number>(this.tiles_y, [Validators.required, Validators.min(5), Validators.max(24)]),
    customBombs: new FormControl<number>(this.num_bombs, [Validators.required, Validators.min(1)]),
  }, this.maxBombsValidator)

  submit_custom_diff_form(): void {
    if (this.customDiffForm.valid) {
      this.set_difficulty(MinesweeperDifficulty.Custom)
    }
  }

  get customWidth() {
    return this.customDiffForm.controls.customWidth
  }

  get customHeight() {
    return this.customDiffForm.controls.customHeight
  }

  get customBombs() {
    return this.customDiffForm.controls.customBombs
  }

  close_menu() {
    this.selected_menu.set(MinesweeperMenu.None)
    this.custom_form_open.set(false)

    // reset custom form when menu closed
    if (this.customDiffForm.touched || this.customDiffForm.dirty) {
      this.customDiffForm.controls.customWidth.setValue(this.tiles_x)
      this.customDiffForm.controls.customHeight.setValue(this.tiles_y)
      this.customDiffForm.controls.customBombs.setValue(this.num_bombs)
      this.customDiffForm.markAsPristine()
      this.customDiffForm.markAsUntouched()
    }
  }
}