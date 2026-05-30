import { Component, computed, DestroyRef, inject, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { SNAKE_THEMES, SnakeCookie, SnakeDir, SnakeGame, SnakeTheme } from './snake-helper';
import { SizeService } from '../../../../services/size-service';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-snake',
  imports: [MatSelectModule],
  providers: [CookieService],
  templateUrl: './snake.html',
  styleUrl: './snake.scss',
})
export class Snake {
  // page navigation
  private readonly router = inject(Router);

  returnToGamesMenu() {
    this.router.navigate(['/games']);
  }

  // cookie service
  private readonly cookieService = inject(CookieService);

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
   * - settings
   *   - speed
   *   - food strength
   */
  game: SnakeGame;
  gameInProgress: Signal<boolean>;

  allThemes = SNAKE_THEMES;
  themeName: WritableSignal<string> = signal('Paper');
  theme: Signal<SnakeTheme> = computed(() => (this.allThemes.get(this.themeName())!));
  showGrid: WritableSignal<boolean> = signal(false);
  highScore: WritableSignal<number> = signal(1);

  constructor() {
    this.load_cookies();
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
      if (this.game.snake_len() > this.highScore()) this.update_high_score(this.game.snake_len());
    }, 75);

    const destroy_ref = inject(DestroyRef);
    destroy_ref.onDestroy(() => {clearInterval(timer_obj);});
  }

  load_cookies(): void {
    const saved_theme = this.cookieService.get(SnakeCookie.Theme);
    if (saved_theme.length > 0 && this.allThemes.get(saved_theme)) this.themeName.set(saved_theme);

    if (this.cookieService.get(SnakeCookie.Grid) === 'true') this.showGrid.set(true);

    const saved_high_score = this.cookieService.get(SnakeCookie.HighScore);
    if (/^\d+$/.test(saved_high_score)) {
      // refresh cookie on initial page load
      this.update_high_score(Number(saved_high_score));
    }
  }

  new_game(): void {
    this.game.new_game();
  }

  update_high_score(new_hs: number): void {
    this.highScore.set(new_hs);
    this.cookieService.set(SnakeCookie.HighScore, String(new_hs), 365);
  }

  update_theme(e: MatSelectChange): void {
    const new_key = typeof(e.value) === 'string' ? e.value as string : undefined;
    if (new_key && this.allThemes.get(new_key)) {
      this.themeName.set(new_key);
      this.cookieService.set(SnakeCookie.Theme, new_key, 14);
    }

    e.source.close();
  }

  theme_option_style(themeName: string): string {
    const opt_theme = this.allThemes.get(themeName);
    if (opt_theme) {
      let opt_theme_style = '';
      opt_theme_style += `color: ${opt_theme.textColor};`;
      opt_theme_style += `background-color: ${opt_theme.backgroundColor};`;
      return opt_theme_style;
    }

    return '';
  }

  toggle_show_grid(): void {
    this.showGrid.update(sg => !sg);
    this.cookieService.set(SnakeCookie.Grid, String(this.showGrid()), 14);
  }

  get_grid_style(showGrid: boolean, currTheme: SnakeTheme): string {
    if (!showGrid) return `1px solid ${currTheme.gameBackground ?? currTheme.backgroundColor}`;
    return `1px solid ${currTheme.gridColor}`;
  }

  get_sq_background_color(id: string, isSnake: boolean, isFood: boolean, lossPos: readonly [number, number] | undefined, curr_theme: SnakeTheme): string {
    if (lossPos && id === `${lossPos[0]}_${lossPos[1]}`) return curr_theme.snakeLossColor;
    else if (isSnake) return curr_theme.snakeColor;
    else if (isFood) return curr_theme.foodColor;
    else return 'inherit';
  }
}
