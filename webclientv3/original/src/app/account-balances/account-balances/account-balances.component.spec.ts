import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBalancesComponent } from './account-balances.component';

describe('AccountBalancesComponent', () => {
  let component: AccountBalancesComponent;
  let fixture: ComponentFixture<AccountBalancesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountBalancesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
