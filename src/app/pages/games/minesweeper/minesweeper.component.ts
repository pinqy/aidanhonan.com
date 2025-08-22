import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-minesweeper',
  standalone: true,
  imports: [],
  templateUrl: './minesweeper.component.html',
  styleUrl: './minesweeper.component.scss'
})
export class MinesweeperComponent {
  private router = inject(Router)

  returnToGamesMenu() {
    this.router.navigate(["/games"])
  }
}
