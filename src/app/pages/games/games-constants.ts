export interface Game {
  displayName: string,
  path: string,
  iconPath?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lazyLoad: () => any,
}

export const GAMES: Game[] = [
  {
    displayName: 'Minesweeper', 
    path: 'minesweeper',
    iconPath: 'assets/games/game-icon-minesweeper.png',
    lazyLoad: () => import('./minesweeper/minesweeper').then(m => m.MinesweeperComponent),
  },
  {
    displayName: 'Solitaire',
    path: 'solitaire',
    iconPath: 'assets/games/game-icon-solitaire.png',
    lazyLoad: () => import('./solitaire/solitaire').then(m => m.Solitaire),
  },
  {
    displayName: 'Snake',
    path: 'snake',
    iconPath: 'assets/games/game-icon-snake.png',
    lazyLoad: () => import('./snake/snake').then(m => m.Snake),
  },
  /**
   * Future options
   * - Pinball
   * - BlackJack
   * - Craps (throwback)
   */
];