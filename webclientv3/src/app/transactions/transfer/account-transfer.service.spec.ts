import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { TestConfigModule } from "../../../../test/test-config.module";
import { ApiGateway } from "../../../api/api-gateway.service";
import { AccountTransferData } from "./account-transfer-data.model";

import { AccountTransferService } from "./account-transfer.service";

describe("BankTransferService", () => {
  let bankTransferService: AccountTransferService;
  let apiGateway: ApiGateway;
  let sampleData: AccountTransferData = {
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
    bankTransferService = TestBed.get(AccountTransferService);
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
      expect(args[0]).toEqual("/bank_accounts/1/transfer");
      expect(args[1]).toEqual(sampleData);
    });
  });
});
