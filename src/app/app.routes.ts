import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { BackendTestComponent } from './pages/backend-test/backend-test.component';
import { GamesComponent } from './pages/games/games.component';

export const routes: Routes = [
    { path: '', title: 'Aidan Honan', component: HomePageComponent },
    { path: 'backend-test', title: 'Backend Test | Aidan Honan', component: BackendTestComponent },
    { path: 'games', title: 'Games | Aidan Honan', component: GamesComponent },
    { path: '**', title: 'Page Not Found | Aidan Honan', component: PageNotFoundComponent },
];
