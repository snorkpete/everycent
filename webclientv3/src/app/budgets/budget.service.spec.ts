import { TestBed, inject } from '@angular/core/testing';

import { BudgetService } from './budget.service';
import {ApiGateway} from "../../api/api-gateway.service";
import {ApiGatewayStub} from "../../../test/stub-services/api-gateway-stub";

describe('BudgetsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BudgetService,
        {provide: ApiGateway, useValue: ApiGatewayStub}
      ]
    });
  });

  it('should be created', inject([BudgetService], (service: BudgetService) => {
    expect(service).toBeTruthy();
  }));
});
