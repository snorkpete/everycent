import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeListHeaderComponent } from './income-list-header.component';

describe('IncomeListHeaderComponent', () => {
  let component: IncomeListHeaderComponent;
  let fixture: ComponentFixture<IncomeListHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncomeListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
