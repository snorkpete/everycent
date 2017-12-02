import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBalanceTotalsComponent } from './account-balance-totals.component';
import {SharedModule} from "../../shared/shared.module";
import {AccountBalancesService} from "../account-balances.service";
import {Observable} from "rxjs/Observable";
import {AccountBalancesServiceStub} from "../../../../test/account-balances-service-stub";

describe('AccountBalanceTotalsComponent', () => {
  let component: AccountBalanceTotalsComponent;
  let fixture: ComponentFixture<AccountBalanceTotalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
      ],
      declarations: [ AccountBalanceTotalsComponent ],
      providers: [
        { provide: AccountBalancesService, useValue: AccountBalancesServiceStub }
      ]
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
