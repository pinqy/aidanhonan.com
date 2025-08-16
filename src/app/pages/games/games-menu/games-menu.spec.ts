import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamesMenuComponent } from './games-menu';

describe('GamesMenu', () => {
  let component: GamesMenuComponent;
  let fixture: ComponentFixture<GamesMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamesMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GamesMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
