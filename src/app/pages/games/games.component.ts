import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Game, GAMES } from './games-constants';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-games',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './games.component.html',
  styleUrl: './games.component.scss'
})
export class GamesComponent {
  games: Game[] = []
  gameIconPathDefault = "game-icon-default.png"

  constructor() {
    this.games = GAMES
  }
}
