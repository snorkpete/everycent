import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBalanceTotalsComponent } from './account-balance-totals.component';

describe('AccountBalanceTotalsComponent', () => {
  let component: AccountBalanceTotalsComponent;
  let fixture: ComponentFixture<AccountBalanceTotalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountBalanceTotalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBalanceTotalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
