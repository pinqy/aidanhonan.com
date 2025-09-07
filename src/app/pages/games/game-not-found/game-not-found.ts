import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-not-found',
  standalone: true,
  imports: [],
  templateUrl: './game-not-found.html',
  styleUrl: './game-not-found.scss'
})
export class GameNotFoundComponent {
  private readonly router = inject(Router)

  returnToGamesMenu() {
    this.router.navigate(["/games"])
  }
}
