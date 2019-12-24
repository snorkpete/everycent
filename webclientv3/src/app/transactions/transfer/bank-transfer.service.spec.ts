import { TestBed } from "@angular/core/testing";
import { of } from "rxjs/internal/observable/of";
import { TestConfigModule } from "../../../../test/test-config.module";
import { ApiGateway } from "../../../api/api-gateway.service";
import { BankAccountData } from "../../bank-accounts/bank-account.model";
import { BudgetData } from "../../budgets/budget.model";
import { BankTransferData } from "./bank-transfer-data.model";

import { BankTransferService } from "./bank-transfer.service";
import { TransactionData } from "../transaction-data.model";
import { TransactionService } from "../transaction.service";

describe("BankTransferService", () => {
  let bankTransferService: BankTransferService;
  let apiGateway: ApiGateway;
  let sampleData: BankTransferData = {
    from: 1,
    to: 2,
    amount: 400,
    date: "2019-10-20"
  };

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TestConfigModule]
    })
  );

  beforeEach(() => {
    bankTransferService = TestBed.get(BankTransferService);
    apiGateway = TestBed.get(ApiGateway);
  });

  it("should be created", () => {
    expect(bankTransferService).toBeTruthy();
  });

  describe("#transfer", () => {
    it("exists", () => {
      expect(bankTransferService.transfer).toBeDefined();
    });

    it("calls the apiGateway with a POST", () => {
      let apiSpy = spyOn(apiGateway, "post").and.returnValue(
        of({ success: true })
      );
      bankTransferService.transfer(sampleData).subscribe();
      expect(apiSpy.calls.count()).toEqual(1);
      let args = apiSpy.calls.mostRecent().args;
      expect(args[0]).toEqual("/bank-accounts/1/transfer");
      expect(args[1]).toEqual(sampleData);
    });
  });
});
