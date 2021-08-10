import { TestBed, inject } from "@angular/core/testing";
import { of } from "rxjs";
import { TestConfigModule } from "../../../test/test-config.module";
import { BankAccountService } from "../bank-accounts/bank-account.service";
import { BudgetService } from "../budgets/budget.service";
import { SinkFundAllocationData } from "../sink-funds/sink-fund-allocation-data.model";
import { AllocationData } from "./allocation-data.model";
import { TransactionData } from "./transaction-data.model";

import { TransactionDataService } from "./transaction-data.service";
import { TransactionSearchParams } from "./transaction-search-form/transaction-search-params.model";
import { TransactionService } from "./transaction.service";

describe("TransactionDataService", () => {
  let transactionDataService: TransactionDataService;
  let transactionService: TransactionService;
  let budgetService: BudgetService;
  let bankAccountService: BankAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule],
      providers: [
        TransactionDataService,
        TransactionService,
        BankAccountService,
        BudgetService
      ]
    });
  });

  beforeEach(() => {
    transactionDataService = TestBed.inject(TransactionDataService);
    transactionService = TestBed.inject(TransactionService);
    budgetService = TestBed.inject(BudgetService);
    bankAccountService = TestBed.inject(BankAccountService);
  });

  it(
    "should be created",
    inject([TransactionDataService], (service: TransactionDataService) => {
      expect(service).toBeTruthy();
    })
  );

  describe("#refreshData", () => {
    let firstRequest: TransactionSearchParams = {
      bank_account_id: 10,
      budget_id: 20
    };

    let differentRequest: TransactionSearchParams = {
      bank_account_id: 100,
      budget_id: 200
    };

    let budgetSpy;
    let bankAccountSpy;
    let transactionSpy;

    let sampleTransactions: TransactionData[] = [
      { id: 1, description: "First Transaction" },
      { id: 2, description: "Second Transaction" }
    ];

    let sampleAllocations: AllocationData[] = [
      { id: 10, name: "First Allocation" },
      { id: 20, name: "Second Allocation" }
    ];

    let sampleSinkFundAllocations: SinkFundAllocationData[] = [
      { id: 111, name: "First Sink Fund Allocation" },
      { id: 211, name: "Second Sink Fund Allocation" }
    ];

    beforeEach(() => {
      transactionSpy = spyOn(
        transactionService,
        "getTransactions"
      ).and.returnValue(of(sampleTransactions));
      bankAccountSpy = spyOn(
        bankAccountService,
        "getSinkFundAllocations"
      ).and.returnValue(of(sampleSinkFundAllocations));
      budgetSpy = spyOn(budgetService, "getAllocations").and.returnValue(
        of(sampleAllocations)
      );
    });

    it("requests new transactions", () => {
      transactionDataService
        .allData$()
        .subscribe(([transactions, allocations, sinkFundAllocations]) => {
          expect(transactions).toEqual(sampleTransactions);
        });
      transactionDataService.refresh(firstRequest);

      expect(transactionSpy.calls.count()).toBe(1);
      expect(transactionSpy.calls.mostRecent().args[0]).toEqual(firstRequest);
    });

    it("requests new allocations", () => {
      transactionDataService
        .allData$()
        .subscribe(([transactions, allocations, sinkFundAllocations]) => {
          expect(allocations).toEqual(sampleAllocations);
        });
      transactionDataService.refresh(firstRequest);
      expect(budgetSpy.calls.count()).toBe(1);
      expect(budgetSpy.calls.mostRecent().args[0]).toEqual(
        firstRequest.budget_id
      );
    });

    it("requests new sink fund allocations", () => {
      transactionDataService
        .allData$()
        .subscribe(([transactions, allocations, sinkFundAllocations]) => {
          expect(sinkFundAllocations).toEqual(sampleSinkFundAllocations);
        });
      transactionDataService.refresh(firstRequest);
      expect(bankAccountSpy.calls.count()).toBe(1);
      expect(bankAccountSpy.calls.mostRecent().args[0]).toEqual(
        firstRequest.bank_account_id
      );
    });

    it("requests new transactions again if called with same data", () => {
      transactionDataService.allData$().subscribe();
      transactionDataService.refresh(firstRequest);
      transactionDataService.refresh(firstRequest);
      expect(transactionSpy.calls.count()).toBe(2);

      transactionDataService.refresh({
        bank_account_id: firstRequest.bank_account_id
      });
      expect(transactionSpy.calls.count()).toBe(3);
    });

    it("requests new transactions again if called with different data", () => {
      transactionDataService.allData$().subscribe();
      transactionDataService.refresh(firstRequest);
      transactionDataService.refresh(differentRequest);
      expect(transactionSpy.calls.count()).toBe(2);
    });

    it("requests new allocations again if called with different data", () => {
      transactionDataService.allData$().subscribe();
      transactionDataService.refresh(firstRequest);
      transactionDataService.refresh(differentRequest);
      expect(budgetSpy.calls.count()).toBe(2);
    });

    it("requests new allocations again if called with same data", () => {
      transactionDataService.allData$().subscribe();
      transactionDataService.refresh(firstRequest);
      transactionDataService.refresh(firstRequest);
      expect(budgetSpy.calls.count()).toBe(2);
    });

    it("requests new again if called with different bank_account_id but same budget id", () => {
      transactionDataService.allData$().subscribe();
      transactionDataService.refresh(firstRequest);
      transactionDataService.refresh({
        budget_id: firstRequest.budget_id,
        bank_account_id: 555
      });
      expect(budgetSpy.calls.count()).toBe(2);
    });

    it("requests new sinkFundAllocations again if called with different data", () => {
      transactionDataService.allData$().subscribe();
      transactionDataService.refresh(firstRequest);
      transactionDataService.refresh(differentRequest);
      expect(bankAccountSpy.calls.count()).toBe(2);
    });

    it("doesn't request sinkFundAllocations again if called with same data", () => {
      transactionDataService.allData$().subscribe();
      transactionDataService.refresh(firstRequest);
      transactionDataService.refresh(firstRequest);
      expect(bankAccountSpy.calls.count()).toBe(1);
    });

    it("doesn't request sinkFundAllocations again if called with different object but same data", () => {
      transactionDataService.allData$().subscribe();
      transactionDataService.refresh(firstRequest);
      transactionDataService.refresh({
        bank_account_id: firstRequest.bank_account_id
      });
      expect(bankAccountSpy.calls.count()).toBe(1);
    });

    it("doesn't request sinkFundAllocations again if called with different bank_account_id but same budget id", () => {
      transactionDataService.allData$().subscribe();
      transactionDataService.refresh(firstRequest);
      transactionDataService.refresh({
        budget_id: 5665,
        bank_account_id: firstRequest.bank_account_id
      });
      expect(bankAccountSpy.calls.count()).toBe(1);
    });
  });
});
