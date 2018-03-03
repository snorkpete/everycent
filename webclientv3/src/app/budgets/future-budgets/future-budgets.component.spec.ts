import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FutureBudgetsComponent } from './future-budgets.component';

describe('FutureBudgetsComponent', () => {
  let component: FutureBudgetsComponent;
  let fixture: ComponentFixture<FutureBudgetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FutureBudgetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureBudgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
