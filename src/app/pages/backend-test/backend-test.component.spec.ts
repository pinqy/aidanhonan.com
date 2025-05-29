import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackendTestComponent } from './backend-test.component';
import { appConfig } from '../../app.config';

describe('BackendTestComponent', () => {
  let component: BackendTestComponent;
  let fixture: ComponentFixture<BackendTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackendTestComponent],
      providers: appConfig.providers,
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackendTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
