import { TestBed, inject } from "@angular/core/testing";
import { of } from "rxjs";
import { ApiGateway } from "../../api/api-gateway.service";
import { BankAccountData } from "../bank-accounts/bank-account.model";
import { BudgetData } from "../budgets/budget.model";
import { TransactionData } from "./transaction-data.model";

import { TransactionService } from "./transaction.service";
import { TestConfigModule } from "../../../test/test-config.module";

describe("TransactionService", () => {
  let transactionService: TransactionService;
  let apiGateway: ApiGateway;
  let sampleTransactions: TransactionData[] = [
    {
      id: 8,
      description: "outside range and deleted",
      transaction_date: "2017-01-17",
      deleted: true
    },
    { id: 4, description: "before start date", transaction_date: "2017-09-30" },
    { id: 3, description: "on start date", transaction_date: "2017-10-01" },
    { id: 1, description: "within range", transaction_date: "2017-10-10" },
    { id: 2, description: "also within range", transaction_date: "2017-10-17" },
    {
      id: 8,
      description: "within range but deleted",
      transaction_date: "2017-10-17",
      deleted: true
    },
    { id: 5, description: "on end date", transaction_date: "2017-10-31" },
    { id: 6, description: "after end date", transaction_date: "2017-11-01" }
  ];

  let budget: BudgetData = {
    id: 200,
    start_date: "2017-10-01",
    end_date: "2017-10-31"
  };

  let bankAccount: BankAccountData = {
    id: 100,
    name: "Savings Account"
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule],
      providers: [TransactionService]
    });
  });

  beforeEach(() => {
    transactionService = TestBed.get(TransactionService);
    apiGateway = TestBed.get(ApiGateway);
  });

  describe("#extractValidTransactionsInBudget", () => {
    it("excludes deleted transactions", () => {
      let transactions: TransactionData[] = [
        {
          id: 8,
          description: "outside range and deleted",
          transaction_date: "2017-01-17",
          deleted: true
        },
        { id: 3, description: "on start date", transaction_date: "2017-10-01" },
        { id: 1, description: "within range", transaction_date: "2017-10-10" },
        {
          id: 9,
          description: "within range but deleted",
          transaction_date: "2017-10-17",
          deleted: true
        }
      ];

      let validTransactions = transactionService.extractValidTransactionsInBudget(
        transactions,
        budget
      );
      expect(validTransactions.length).toEqual(2);
      expect(validTransactions[0]).toEqual(transactions[1]);
      expect(validTransactions[1]).toEqual(transactions[2]);
    });

    it("excludes transactions before the budget period", () => {
      let transactions: TransactionData[] = [
        {
          id: 4,
          description: "before start date",
          transaction_date: "2017-09-30"
        },
        { id: 3, description: "on start date", transaction_date: "2017-10-01" },
        {
          id: 2,
          description: "also within range",
          transaction_date: "2017-10-17"
        }
      ];

      let validTransactions = transactionService.extractValidTransactionsInBudget(
        transactions,
        budget
      );
      expect(validTransactions.length).toEqual(2);
      expect(validTransactions[0]).toEqual(transactions[1]);
      expect(validTransactions[1]).toEqual(transactions[2]);
    });

    it("excludes transactions after the budget period", () => {
      let transactions: TransactionData[] = [
        { id: 1, description: "within range", transaction_date: "2017-10-10" },
        {
          id: 2,
          description: "also within range",
          transaction_date: "2017-10-17"
        },
        { id: 5, description: "on end date", transaction_date: "2017-10-31" },
        { id: 6, description: "after end date", transaction_date: "2017-11-01" }
      ];

      let validTransactions = transactionService.extractValidTransactionsInBudget(
        transactions,
        budget
      );
      expect(validTransactions.length).toEqual(3);
      expect(validTransactions[0]).toEqual(transactions[0]);
      expect(validTransactions[1]).toEqual(transactions[1]);
      expect(validTransactions[2]).toEqual(transactions[2]);
    });
  });

  describe("#save", () => {
    it("calls #extractValidTransactionsInBudget", () => {
      let spy = spyOn(transactionService, "extractValidTransactionsInBudget");
      transactionService.save(sampleTransactions, bankAccount, budget);
      expect(spy.calls.count()).toEqual(1);
      let args = spy.calls.mostRecent().args;
      expect(args[0]).toEqual(sampleTransactions);
      expect(args[1]).toEqual(budget);
    });

    it("calls apiGateway#post correctly", () => {
      let transactionsToPost = [
        { id: 5, description: "on end date", transaction_date: "2017-10-31" }
      ];
      let transactionSpy = spyOn(
        transactionService,
        "extractValidTransactionsInBudget"
      ).and.returnValue(transactionsToPost);
      let gatewaySpy = spyOn(apiGateway, "post").and.returnValue(of([]));
      transactionService
        .save(sampleTransactions, bankAccount, budget)
        .subscribe();
      expect(gatewaySpy.calls.count()).toEqual(1);
      let args = gatewaySpy.calls.mostRecent().args;
      expect(args[0]).toEqual("/transactions");
      expect(args[1]).toEqual({
        bank_account_id: bankAccount.id,
        budget_id: budget.id,
        transactions: transactionsToPost
      });
    });
  });
});
