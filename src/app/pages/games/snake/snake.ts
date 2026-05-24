import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-snake',
  imports: [],
  templateUrl: './snake.html',
  styleUrl: './snake.scss',
})
export class Snake {
  // page navigation
  private readonly router = inject(Router);

  returnToGamesMenu() {
    this.router.navigate(['/games']);
  }

  /**
   * Improvements:
   * - a lot
   */
}
