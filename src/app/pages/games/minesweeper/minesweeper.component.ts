import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MinesweeperDifficulty, MinesweeperSquare, TEST_BOARD } from './minesweeper-constants';

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

  constructor() {
    this.tiles_x = 16
    this.tiles_y = 16
    this.num_bombs = 40

    this.board = TEST_BOARD
    this.new_game()
  }

  new_game(): void {
    // create new board
    const new_board: MinesweeperSquare[][] = []
    for (let i = 0; i < this.tiles_x; i++) {
      new_board.push([])
      for (let j = 0; j < this.tiles_y; j++) {
        new_board[i].push({
          isBomb: false,
          isFlagged: false,
          isQuestioned: false,
          isOpen: true,
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

    // update screen
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

    if (tile.isOpen) {
      classes.push("tile-open")
    } else {
      classes.push("tile-closed")
      if (tile.isFlagged) classes.push("tile-flagged")
      else if (tile.isQuestioned) classes.push("tile-questioned")
    }

    return classes.join(" ")
  }

  get_number_tile_color(tile: MinesweeperSquare): string {
    if (!tile.isOpen) return ""

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
}