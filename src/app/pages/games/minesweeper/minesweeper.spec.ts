import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinesweeperComponent } from './minesweeper';
import { appConfig } from '../../../app.config';

describe('MinesweeperComponent', () => {
  let component: MinesweeperComponent;
  let fixture: ComponentFixture<MinesweeperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinesweeperComponent],
      providers: appConfig.providers,
    })
      .compileComponents();

    fixture = TestBed.createComponent(MinesweeperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
