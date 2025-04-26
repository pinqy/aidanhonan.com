import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackendTestComponent } from './backend-test.component';

describe('BackendTestComponent', () => {
  let component: BackendTestComponent;
  let fixture: ComponentFixture<BackendTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackendTestComponent]
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
