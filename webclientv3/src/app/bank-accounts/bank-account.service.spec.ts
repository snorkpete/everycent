import { inject, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { TestConfigModule } from "../../../test/test-config.module";
import { ApiGateway } from "../../api/api-gateway.service";

import { BankAccountService } from "./bank-account.service";

describe("BankAccountService", () => {
  let bankAccountService: BankAccountService;
  let apiGateway: ApiGateway;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule],
      providers: [BankAccountService]
    });
  });

  beforeEach(() => {
    bankAccountService = TestBed.inject(BankAccountService);
    apiGateway = TestBed.inject(ApiGateway);
  });

  it("should be created", inject(
    [BankAccountService],
    (service: BankAccountService) => {
      expect(service).toBeTruthy();
    }
  ));

  describe("#sinkFundAllocations", () => {
    it("calls the gateway with the right parameters", () => {
      let bank_account_id = 10;
      let spy = spyOn(apiGateway, "get").and.returnValue(of([]));
      bankAccountService.getSinkFundAllocations(bank_account_id);

      expect(spy.calls.count()).toEqual(1);

      let args = spy.calls.mostRecent().args;
      expect(args[0]).toEqual("/sink_fund_allocations");
      expect(args[1]).toEqual({ bank_account_id });
    });
  });
});
