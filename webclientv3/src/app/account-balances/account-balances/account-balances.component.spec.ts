import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBalancesComponent } from './account-balances.component';
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {SharedModule} from "../../shared/shared.module";
import {AccountBalancesService} from "../account-balances.service";
import {ApiGateway} from "../../../api/api-gateway.service";
import {ApiGatewayStub} from "../../../../test/api-gateway-stub";
import {TestConfigModule} from "../../../../test/test-config.module";

describe('AccountBalancesComponent', () => {
  let component: AccountBalancesComponent;
  let fixture: ComponentFixture<AccountBalancesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TestConfigModule,
      ],
      declarations: [ AccountBalancesComponent ],
      schemas: [NO_ERRORS_SCHEMA]
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
