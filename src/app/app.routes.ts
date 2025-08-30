import { Routes, Route } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { BackendTestComponent } from './pages/backend-test/backend-test.component';
import { GamesComponent } from './pages/games/games.component';
import { GAMES } from './pages/games/games-constants';
import { TITLE_SUFFIX } from './constants';
import { GameNotFoundComponent } from './pages/games/game-not-found/game-not-found.component';
import { EmptyComponent } from './common/empty-component/empty';

function titleWithSuffix(titleBase: string) : string {
    return titleBase + TITLE_SUFFIX
}

export const routes: Routes = [
    { path: '', title: 'Aidan Honan', component: HomePageComponent },
    { path: 'backend-test', title: titleWithSuffix('Backend Test'), component: BackendTestComponent },
    { path: 'games', title: titleWithSuffix('Games'), component: GamesComponent,
        children: [
            { path: '', component: EmptyComponent },
            ...GAMES.map<Route>((game) => {
                return {
                    path: game.path,
                    title: titleWithSuffix(game.displayName),
                    loadComponent: game.lazyLoad
                } as Route
            }),
            { path: "**", title: titleWithSuffix("Game Not Found"), component: GameNotFoundComponent },
        ] 
    },
    { path: '**', title: titleWithSuffix('Page Not Found'), component: PageNotFoundComponent },
];