import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccountBalanceTotalsComponent } from './account-balance-totals.component';
import {SharedModule} from "../../shared/shared.module";
import {AccountBalancesService} from "../account-balances.service";
import {Observable} from "rxjs/Observable";
import {AccountBalancesServiceStub} from "../../../../test/stub-services/account-balances-service-stub";

describe('AccountBalanceTotalsComponent', () => {
  let component: AccountBalanceTotalsComponent;
  let fixture: ComponentFixture<AccountBalanceTotalsComponent>;

  beforeEach(waitForAsync(() => {
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
