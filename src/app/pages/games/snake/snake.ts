import { Component, computed, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SnakeDir, SnakeGame } from './snake-helper';
import { SizeService } from '../../../../services/size-service';

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
   * Screen-size based configurations
   */
  sizeService = inject(SizeService);
  squareSize = computed(() => {
    if (this.sizeService.isXSmall()) {return '10px';}
    else if (this.sizeService.isSmall()) {return '10px';}
    else if (this.sizeService.isMedium()) {return '10px';}
    else if (this.sizeService.isLarge()) {return '15px';}
    else if (this.sizeService.isXLarge()) {return '15px';}
    else {return '10px';}
  });

  /**
   * Improvements:
   * - general appearance
   * - settings
   *   - theme
   *   - speed
   *   - food strength
   *   - grid lines
   */
  game: SnakeGame;

  constructor() {
    this.game = new SnakeGame();

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      switch(event.key.toLocaleLowerCase()) {
        case 'w':
        case 'arrowup':
          this.game.turn(SnakeDir.U);
          break;
        case 'a':
        case 'arrowleft':
          this.game.turn(SnakeDir.L);
          break;
        case 's':
        case 'arrowdown':
          this.game.turn(SnakeDir.D);
          break;
        case 'd':
        case 'arrowright':
          this.game.turn(SnakeDir.R);
          break;
      }
    });

    // initialize timer that will "tick" and attempt to move the snake 1 space
    // change interval for snake speed/animation
    const timer_obj = setInterval(() => {
      this.game.move();
    }, 75);

    const destroy_ref = inject(DestroyRef);
    destroy_ref.onDestroy(() => {clearInterval(timer_obj);});
  }

  new_game(): void {
    this.game.new_game();
  }

  get_background_color(id: string, isSnake: boolean, isFood: boolean, lossPos: readonly [number, number] | undefined): string {
    if (lossPos && id === `${lossPos[0]}_${lossPos[1]}`) return 'lightblue';
    else if (isSnake) return 'blue';
    else if (isFood) return 'red';
    else return 'inherit';
  }
}
