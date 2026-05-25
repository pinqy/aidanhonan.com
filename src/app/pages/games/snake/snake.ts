import { Component, computed, DestroyRef, inject, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { SNAKE_THEMES, SnakeDir, SnakeGame, SnakeTheme } from './snake-helper';
import { SizeService } from '../../../../services/size-service';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-snake',
  imports: [MatSelectModule],
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
   *   - prettify/add themes
   *   - score (length)
   * - settings
   *   - speed
   *   - food strength
   *   - grid lines
   */
  game: SnakeGame;
  gameInProgress: Signal<boolean>;

  allThemes = SNAKE_THEMES;
  themeName: WritableSignal<string> = signal('Default');
  theme: Signal<SnakeTheme> = computed(() => (this.allThemes.get(this.themeName())!));

  constructor() {
    this.game = new SnakeGame();
    this.gameInProgress = computed(() => this.game.game_started() && !this.game.game_over());

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

  update_theme(e: MatSelectChange): void {
    const new_key = typeof(e.value) === 'string' ? e.value as string : undefined;
    if (new_key && this.allThemes.get(new_key)) this.themeName.set(new_key);
  }

  theme_option_style(themeName: string): string {
    const opt_theme = this.allThemes.get(themeName);
    if (opt_theme) {
      let opt_theme_style = '';
      opt_theme_style += `color: ${opt_theme.headerColor};`;
      opt_theme_style += `background-color: ${opt_theme.borderBackground};`;
      return opt_theme_style;
    }

    return '';
  }

  get_sq_background_color(id: string, isSnake: boolean, isFood: boolean, lossPos: readonly [number, number] | undefined, curr_theme: SnakeTheme): string {
    if (lossPos && id === `${lossPos[0]}_${lossPos[1]}`) return curr_theme.snakeLossColor;
    else if (isSnake) return curr_theme.snakeColor;
    else if (isFood) return curr_theme.foodColor;
    else return 'inherit';
  }
}
