import { Route } from "@angular/router";
import { MinesweeperComponent } from "./minesweeper/minesweeper.component";
import { TITLE_SUFFIX } from "../../constants";

export interface Game {
    displayName: string,
    route: Route,
}

export const GAMES: Game[] = [
    {
        displayName: "Minesweeper", 
        route: {
            path: "minesweeper",
            title: "Minesweeper" + TITLE_SUFFIX,
            component: MinesweeperComponent,
        },
    },
]