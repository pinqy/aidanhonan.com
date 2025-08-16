import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-games',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './games.component.html',
  styleUrl: './games.component.scss'
})
export class GamesComponent {}
