import { computed, Signal, signal, WritableSignal } from '@angular/core';

export enum SnakeDir {
  L = 'Left',
  R = 'Right',
  U = 'Up',
  D = 'Down',
  None = 'None',
}

export interface SnakeSquare {
  id: string;
  isSnake: WritableSignal<boolean>,
  isFood: WritableSignal<boolean>,
}

export class SnakeGame {
  board: SnakeSquare[][] = [];
  private snake_dir: SnakeDir = SnakeDir.None;

  // snake body, head, and tail will reference coords on the board in the form 'x_y'
  private snake_body: WritableSignal<string[]> = signal(['1_1']);
  readonly snake_len: Signal<number> = computed(() => this.snake_body().length);
  private snake_head: Signal<string> = computed(() => this.snake_body()[this.snake_len()-1]);
  private snake_tail: Signal<string> = computed(() => this.snake_body()[0]);

  // can make this configurable
  private tiles_x = 70;
  private tiles_y = 40;

  // can make this configurable
  private food_strength = 3;

  // can queue moves for smoother turning
  private turn_dir: SnakeDir[] = [];
  private static readonly UP_DOWN = [SnakeDir.U, SnakeDir.D];
  private static readonly LEFT_RIGHT = [SnakeDir.L, SnakeDir.R];

  // loss handling
  loss_pos: WritableSignal<readonly [number, number] | undefined> = signal(undefined);
  game_over: Signal<boolean> = computed(() => this.loss_pos() ? true : false);
  game_started: WritableSignal<boolean> = signal(false);

  constructor() {
    this.new_game();
  }

  new_game(): void {
    this.snake_dir = SnakeDir.None;
    this.turn_dir = [];
    this.loss_pos.set(undefined);
    this.game_started.set(false);

    const new_board: SnakeSquare[][] = [];
    for (let i = 0; i < this.tiles_x; i++) {
      new_board.push([]);
      for (let j = 0; j < this.tiles_y; j++) {
        new_board[i].push({
          id: `${i}_${j}`,
          isSnake: signal(false),
          isFood: signal(false),
        });
      }
    }

    // modifying body/board separately so every board square doesn't need to refresh
    // on each "frame"
    new_board[1][1].isSnake.set(true);
    this.board = new_board;
    this.snake_body.set(['1_1']);

    this.place_food();
  }

  // TODO: should optimize this for long snakes
  private place_food(): void {
    // generate new food position until finding an open spot
    let f_x = 0;
    let f_y = 0;
    do {
      f_x = Math.floor(Math.random() * this.tiles_x);
      f_y = Math.floor(Math.random() * this.tiles_y);
    } while (this.board[f_x][f_y].isSnake());

    this.board[f_x][f_y].isFood.set(true);
  }

  turn(new_dir: SnakeDir): void {
    if (this.turn_dir.length >= 2) return; 
    const compare_dir = this.turn_dir.length > 0 ? this.turn_dir[0] : this.snake_dir;
    if (this.snake_len() === 1 ||
      (SnakeGame.UP_DOWN.includes(compare_dir) && SnakeGame.LEFT_RIGHT.includes(new_dir)) ||
      (SnakeGame.LEFT_RIGHT.includes(compare_dir) && SnakeGame.UP_DOWN.includes(new_dir))) {
      this.turn_dir.push(new_dir);
    }
  }
  move(): void {
    if (this.turn_dir.length > 0) {
      this.snake_dir = this.turn_dir.shift()!;
    }

    if (this.game_over() || this.snake_dir === SnakeDir.None) return;

    this.game_started.set(true);

    // get current head pos (before tail removal in case length is 1)
    const curr_head_pos = SnakeGame.parse_pos(this.snake_head());

    // delete tail
    const curr_tail = this.snake_tail();
    const curr_tail_pos = SnakeGame.parse_pos(curr_tail);
    this.snake_body.update((sb) => sb.slice(1));
    if (curr_tail !== this.snake_tail()) { // these will be identical after eating food
      this.board[curr_tail_pos[0]][curr_tail_pos[1]].isSnake.set(false);
    }
    
    // get new head position
    const new_head_pos = this.get_new_head_pos(curr_head_pos);
    const new_head_pos_str = `${new_head_pos[0]}_${new_head_pos[1]}`;

    // check for loss
    if (this.snake_body().includes(new_head_pos_str) || new_head_pos[0] < 0 || new_head_pos[0] >= this.tiles_x || new_head_pos[1] < 0 || new_head_pos[1] >= this.tiles_y) {
      this.loss_pos.set(new_head_pos);
      this.snake_body.update((sb) => sb.concat(new_head_pos_str)); // still update this so length doesn't drop by 1 on loss
      return;
    }

    // move head
    this.snake_body.update((sb) => sb.concat(new_head_pos_str));
    const new_head_sq = this.board[new_head_pos[0]][new_head_pos[1]];
    new_head_sq.isSnake.set(true);

    // eat food
    if (new_head_sq.isFood()) {
      // add duplicate tail entries so snake will extend as it moves
      const new_len: string[] = [];
      for(let i = 0; i < this.food_strength; i++) new_len.push(this.snake_tail());
      this.snake_body.update((sb) => new_len.concat(sb));
      new_head_sq.isFood.set(false);
      this.place_food();
    }
  }

  private get_new_head_pos(pos: readonly [number, number]): readonly [number, number] {
    switch(this.snake_dir) {
      case(SnakeDir.L): return [pos[0]-1, pos[1]];
      case(SnakeDir.R): return [pos[0]+1, pos[1]];
      case(SnakeDir.U): return [pos[0], pos[1]-1];
      case(SnakeDir.D): return [pos[0], pos[1]+1];
      default: return pos;
    }
  }

  static parse_pos(pos_str: string): readonly [number, number] {
    const pos = pos_str.split('_');
    return [+pos[0], +pos[1]];
  }
}

export interface SnakeTheme {
  backgroundColor: string,
  gameBackground?: string,
  gridColor: string,
  textColor: string,
  snakeColor: string,
  snakeLossColor: string,
  foodColor: string,
}

export const SNAKE_THEMES: Map<string, SnakeTheme> = new Map<string, SnakeTheme>([
  ['Paper', {
    backgroundColor: 'white',
    gridColor: 'gray',
    textColor: 'black',
    snakeColor: 'blue',
    snakeLossColor: 'darkblue',
    foodColor: 'red',
  }],
  ['Inspo', {
    backgroundColor: '#FC5454',
    gameBackground: 'blue',
    gridColor: 'darkblue',
    textColor: 'white',
    snakeColor: 'yellow',
    snakeLossColor: 'lightgray',
    foodColor: 'red',
  }],
  ['Neon', {
    backgroundColor: 'black',
    gridColor: '#2C0D2A',
    textColor: '#00FFF7',
    snakeColor: '#FF1E9D',
    snakeLossColor: '#a70000',
    foodColor: '#FAD009',
  }],
  ['Pink', {
    backgroundColor: '#940054',
    gridColor: '#aa0261',
    textColor: '#FF1E9D',
    snakeColor: '#FF1E9D',
    snakeLossColor: '#a70000',
    foodColor: '#ff69be',
  }],
]);

export enum SnakeCookie {
  Theme = 'snake_theme',
  Grid = 'snake_grid',
  HighScore = 'snake_high_score',
}
