export interface Game {
    displayName: string,
    path: string,
    iconPath?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lazyLoad: () => any,
}

export const GAMES: Game[] = [
    {
        displayName: "Minesweeper", 
        path: "minesweeper",
        iconPath: "assets/games/game-icon-minesweeper.png",
        lazyLoad: () => import('./minesweeper/minesweeper').then(m => m.MinesweeperComponent)
    },
    {
        displayName: "Test Game",
        path: 'test',
        lazyLoad: () => import('./game-not-found/game-not-found').then(m => m.GameNotFoundComponent)
    },
]