import { SnakeDir, SnakeGame, SnakeSquare } from './snake-helper';

describe('SnakeGame', () => {
  let game: SnakeGame;

  beforeEach(() => {
    game = new SnakeGame();
  });

  it('initializes correctly', () => {
    expect(game.board.length).toEqual(70);
    expect(game.board[0].length).toEqual(40);

    expect(game.board[1][1].isSnake()).toBeTrue();
    const food = find_food(game);
    expect(food.length).toEqual(1);
  });

  it('new_game happy path', () => {
    const initial_food = find_food(game);
    expect(initial_food.length).toEqual(1);
    const if_pos = SnakeGame.parse_pos(initial_food[0].id);
  
    let found_new_food_pos = false;
    const attempts = 0;
    while (!found_new_food_pos && attempts < 3) {
      game.new_game();

      expect(game.board.length).toEqual(70);
      expect(game.board[0].length).toEqual(40);

      expect(game.board[1][1].isSnake()).toBeTrue();
      const food = find_food(game);
      expect(food.length).toEqual(1);
      const f_pos = SnakeGame.parse_pos(food[0].id);
      if (f_pos[0] !== if_pos[0] || f_pos[1] !== if_pos[1]) found_new_food_pos = true;
    }

    if (!found_new_food_pos) {
      fail('new_game did not put food in a new place');
    }
  });

  it('turn+move with length 1 snake', () => {
    // make sure not to accidentally eat food during this test
    while (SnakeGame.parse_pos(find_food(game)[0].id)[1] < 5) game.new_game();

    expect(game.board[1][1].isSnake()).toBeTrue();

    game.turn(SnakeDir.D);
    game.move();
    expect(game.board[1][1].isSnake()).toBeFalse();
    expect(game.board[1][2].isSnake()).toBeTrue();

    game.turn(SnakeDir.U);
    game.move();
    expect(game.board[1][1].isSnake()).toBeTrue();
    expect(game.board[1][2].isSnake()).toBeFalse();

    game.turn(SnakeDir.R);
    game.move();
    game.move();
    game.move();
    expect(game.board[4][1].isSnake()).toBeTrue();

    game.turn(SnakeDir.L);
    game.move();
    expect(game.board[3][1].isSnake()).toBeTrue();
    expect(game.board[4][1].isSnake()).toBeFalse();
  });

  it('turn queues up to 2 moves', () => {
    game.turn(SnakeDir.R);
    game.turn(SnakeDir.D);
    game.move();
    expect(game.board[2][1].isSnake()).toBeTrue();
    game.move();
    expect(game.board[2][2].isSnake()).toBeTrue();

    game.turn(SnakeDir.R);
    game.turn(SnakeDir.D);
    game.turn(SnakeDir.L); // should be ignored
    game.move();
    expect(game.board[3][2].isSnake()).toBeTrue();
    game.turn(SnakeDir.R); // should not be ignored
    game.move();
    expect(game.board[3][3].isSnake()).toBeTrue();
    game.move();
    expect(game.board[4][3].isSnake()).toBeTrue();
    expect(game.board[2][3].isSnake()).toBeFalse();

  });

  it('starts stationary', () => {
    game.move();
    expect(game.board[1][1].isSnake()).toBeTrue();
    expect(game.board[1][2].isSnake()).toBeFalse();
    expect(game.board[2][1].isSnake()).toBeFalse();
    expect(game.board[1][0].isSnake()).toBeFalse();
    expect(game.board[0][1].isSnake()).toBeFalse();
  });

  it('eat food happy path', () => {
    let food_pos = SnakeGame.parse_pos(find_food(game)[0].id);

    // make this test simpler by avoiding edge cases for food location
    while (food_pos[0] < 4 || food_pos[1] < 4 || food_pos[0] >= 67 || food_pos[1] >= 37) {
      game.new_game();
      food_pos = SnakeGame.parse_pos(find_food(game)[0].id);
    }

    game.turn(SnakeDir.R);
    for (let i = 0; i < (food_pos[0]-1); i++) game.move();
    game.turn(SnakeDir.D);
    for (let i = 0; i < (food_pos[1]-1); i++) game.move();
    expect(game.board[food_pos[0]][food_pos[1]].isSnake()).toBeTrue();

    const new_food_pos = SnakeGame.parse_pos(find_food(game)[0].id);
    expect(new_food_pos[0] !== food_pos[0] || new_food_pos[1] !== food_pos[1]).toBeTrue();

    let new_food_left = false;
    for (let i = 0; i < 4; i++)
      if (game.board[food_pos[0]-i][food_pos[1]].isFood()) new_food_left = true;

    game.turn(new_food_left ? SnakeDir.R : SnakeDir.L);
    game.move();
    game.move();
    game.move();
    const hor_move_num = new_food_left ? 1 : -1;
    expect(game.board[food_pos[0]+(3*hor_move_num)][food_pos[1]].isSnake()).toBeTrue();
    expect(game.board[food_pos[0]+(2*hor_move_num)][food_pos[1]].isSnake()).toBeTrue();
    expect(game.board[food_pos[0]+(1*hor_move_num)][food_pos[1]].isSnake()).toBeTrue();
    expect(game.board[food_pos[0]][food_pos[1]].isSnake()).toBeTrue();

    // test no reversing horizontally
    game.turn(new_food_left ? SnakeDir.L : SnakeDir.R);
    game.move();
    expect(game.board[food_pos[0]+(4*hor_move_num)][food_pos[1]].isSnake()).toBeTrue();
    expect(game.board[food_pos[0]][food_pos[1]].isSnake()).toBeFalse();

    let new_food_up = false;
    for (let i = 0; i < 4; i++)
      if (game.board[food_pos[0]+(4*hor_move_num)][food_pos[1]-i].isFood()) new_food_up = true;

    game.turn(new_food_up ? SnakeDir.D : SnakeDir.U);
    game.move();
    game.move();
    game.move();
    const vert_move_num = new_food_up ? 1 : -1;
    expect(game.board[food_pos[0]+(4*hor_move_num)][food_pos[1]+(3*vert_move_num)].isSnake()).toBeTrue();
    expect(game.board[food_pos[0]+(4*hor_move_num)][food_pos[1]+(2*vert_move_num)].isSnake()).toBeTrue();
    expect(game.board[food_pos[0]+(4*hor_move_num)][food_pos[1]+(1*vert_move_num)].isSnake()).toBeTrue();
    expect(game.board[food_pos[0]+(4*hor_move_num)][food_pos[1]].isSnake()).toBeTrue();

    // test no reversing vertically
    game.turn(new_food_up ? SnakeDir.U : SnakeDir.D);
    game.move();
    expect(game.board[food_pos[0]+(4*hor_move_num)][food_pos[1]+(4*vert_move_num)].isSnake()).toBeTrue();
    expect(game.board[food_pos[0]+(4*hor_move_num)][food_pos[1]].isSnake()).toBeFalse();
  });

  it('edge collision loses the game', () => {
    game.turn(SnakeDir.L);
    game.move();
    expect(game.game_over()).toBeFalse();
    game.move();
    expect(game.game_over()).toBeTrue();
    game.move(); // make sure no NPE or anything when moving after loss

    game.new_game();
    game.turn(SnakeDir.U);
    game.move();
    expect(game.game_over()).toBeFalse();
    game.move();
    expect(game.game_over()).toBeTrue();

    game.new_game();
    game.turn(SnakeDir.R);
    for (let i = 0; i < 68; i++) game.move();
    expect(game.game_over()).toBeFalse();
    game.move();
    expect(game.game_over()).toBeTrue();

    game.new_game();
    game.turn(SnakeDir.D);
    for (let i = 0; i < 38; i++) game.move();
    expect(game.game_over()).toBeFalse();
    game.move();
    expect(game.game_over()).toBeTrue();
  });

  it('parse_pos happy path', () => {
    const x = 23;
    const y = 15;
    const pos = SnakeGame.parse_pos(game.board[x][y].id);
    expect(pos.length).toEqual(2);
    expect(pos[0]).toEqual(x);
    expect(pos[1]).toEqual(y);
  });
});

function find_food(game: SnakeGame): SnakeSquare[] {
  const food: SnakeSquare[] = [];
  game.board.forEach((col) => {
    col.forEach((sq) => {
      if (sq.isFood()) food.push(sq);
    });
  });
  return food;
}
