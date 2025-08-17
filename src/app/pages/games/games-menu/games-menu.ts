import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Game, GAMES } from '../games-constants';

@Component({
  selector: 'app-games-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './games-menu.html',
  styleUrl: './games-menu.scss'
})
export class GamesMenuComponent {
  games: Game[] = []
  gameIconPathDefault = "game-icon-default.png"

  constructor() {
    this.games = GAMES
  }
}
