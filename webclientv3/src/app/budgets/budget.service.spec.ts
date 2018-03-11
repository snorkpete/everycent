import { TestBed, inject } from '@angular/core/testing';
import {Observable} from "rxjs/Observable";

import { BudgetService } from './budget.service';
import {ApiGateway} from "../../api/api-gateway.service";
import {ApiGatewayStub} from "../../../test/stub-services/api-gateway-stub";

describe('BudgetsService', () => {
  let budgetService: BudgetService;
  let apiGateway: ApiGateway;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BudgetService,
        {provide: ApiGateway, useValue: ApiGatewayStub}
      ]
    });
  });

  beforeEach(() => {
    budgetService = TestBed.get(BudgetService);
    apiGateway = TestBed.get(ApiGateway);
  });

  it('should be created', inject([BudgetService], (service: BudgetService) => {
    expect(service).toBeTruthy();
  }));

  describe("#getAllocations", () => {
    it("calls the gateway with the right parameters", () => {
      let spy = spyOn(apiGateway, "get").and.returnValue(Observable.of([]));
      let budgetId = 1;
      budgetService.getAllocations(budgetId);
      expect(spy.calls.count()).toEqual(1);

      let args = spy.calls.mostRecent().args;
      expect(args[0]).toEqual('/allocations');
      expect(args[1]).toEqual({budget_id: budgetId});
    });

  });
});
