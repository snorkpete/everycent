import { inject, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiGatewayStub } from "../../../test/stub-services/api-gateway-stub";
import { ApiGateway } from "../../api/api-gateway.service";

import { BudgetService } from "./budget.service";

describe("BudgetsService", () => {
  let budgetService: BudgetService;
  let apiGateway: ApiGateway;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BudgetService,
        { provide: ApiGateway, useValue: ApiGatewayStub }
      ]
    });
  });

  beforeEach(() => {
    budgetService = TestBed.inject(BudgetService);
    apiGateway = TestBed.inject(ApiGateway);
  });

  it("should be created", inject([BudgetService], (service: BudgetService) => {
    expect(service).toBeTruthy();
  }));

  describe("#getAllocations", () => {
    it("calls the gateway with the right parameters", () => {
      let spy = spyOn(apiGateway, "get").and.returnValue(of([]));
      let budgetId = 1;
      budgetService.getAllocations(budgetId);
      expect(spy.calls.count()).toEqual(1);

      let args = spy.calls.mostRecent().args;
      expect(args[0]).toEqual("/allocations");
      expect(args[1]).toEqual({ budget_id: budgetId });
    });
  });
});
