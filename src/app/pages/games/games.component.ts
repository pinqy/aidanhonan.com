import { Component, inject, signal } from '@angular/core';
import { Event, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Game, GAMES } from './games-constants';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-games',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './games.component.html',
  styleUrl: './games.component.scss'
})
export class GamesComponent {
  private readonly router = inject(Router)
  private readonly gameDetailRegex: RegExp = /\/games\/\S+/
  isGameDetailView = signal(false)

  games: Game[] = []
  gameIconPathDefault = "games/game-icon-default.png"

  constructor() {
    // When navigating off of "/games" page, disable games menu links
    // and display the games detail page
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (this.gameDetailRegex.test(event.url)) {
          this.isGameDetailView.set(true)
        } else {
          this.isGameDetailView.set(false)
        }
      }
    })

    this.games = GAMES
  }
}
