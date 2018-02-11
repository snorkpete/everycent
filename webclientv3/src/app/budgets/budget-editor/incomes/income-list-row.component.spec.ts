import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeListRowComponent } from './income-list-row.component';

describe('IncomeListRowComponent', () => {
  let component: IncomeListRowComponent;
  let fixture: ComponentFixture<IncomeListRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncomeListRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeListRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
