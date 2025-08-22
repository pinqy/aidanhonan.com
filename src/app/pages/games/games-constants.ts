import { Type } from "@angular/core";
import { GameNotFoundComponent } from "./game-not-found/game-not-found.component";
import { MinesweeperComponent } from "./minesweeper/minesweeper.component";

export interface Game {
    displayName: string,
    path: string,
    component: Type<MinesweeperComponent> | Type<GameNotFoundComponent>,
    iconPath?: string,
}

export const GAMES: Game[] = [
    {
        displayName: "Minesweeper", 
        path: "minesweeper",
        component: MinesweeperComponent,
        iconPath: "game-icon-minesweeper.png",
    },
    {
        displayName: "Test Game",
        path: 'test',
        component: GameNotFoundComponent,
    },
]