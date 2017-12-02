import { TestBed, inject } from '@angular/core/testing';

import { AccountBalancesService } from './account-balances.service';
import {ApiGateway} from "../../api/api-gateway.service";
import {ApiGatewayStub} from "../../../test/api-gateway-stub";

describe('AccountBalancesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AccountBalancesService,
        { provide: ApiGateway, useValue: ApiGatewayStub },
      ]
    });
  });

  it('should ...', inject([AccountBalancesService], (service: AccountBalancesService) => {
    expect(service).toBeTruthy();
  }));
});
