import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-not-found',
  standalone: true,
  imports: [],
  templateUrl: './game-not-found.component.html',
  styleUrl: './game-not-found.component.scss'
})
export class GameNotFoundComponent {
  private router = inject(Router)

  returnToGamesMenu() {
    this.router.navigate(["/games"])
  }
}
