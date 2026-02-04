import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Solitaire } from './solitaire';

describe('Solitaire', () => {
  let component: Solitaire;
  let fixture: ComponentFixture<Solitaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Solitaire],
    })
      .compileComponents();

    fixture = TestBed.createComponent(Solitaire);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
