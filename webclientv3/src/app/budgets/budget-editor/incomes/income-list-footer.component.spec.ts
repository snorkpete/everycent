import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeListFooterComponent } from './income-list-footer.component';

describe('IncomeListFooterComponent', () => {
  let component: IncomeListFooterComponent;
  let fixture: ComponentFixture<IncomeListFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncomeListFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeListFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
