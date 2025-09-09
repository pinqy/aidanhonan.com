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
        displayName: "Solitaire",
        path: 'solitaire',
        lazyLoad: () => import('./solitaire/solitaire').then(m => m.Solitaire)
    },
]