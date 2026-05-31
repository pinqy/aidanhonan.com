import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Snake } from './snake';
import { appConfig } from '../../../app.config';

describe('Snake', () => {
  let component: Snake;
  let fixture: ComponentFixture<Snake>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Snake],
      providers: appConfig.providers,
    })
      .compileComponents();

    fixture = TestBed.createComponent(Snake);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
