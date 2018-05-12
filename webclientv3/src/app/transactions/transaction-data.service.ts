import { Injectable } from "@angular/core";
import { combineLatest, Subject } from "rxjs";
import { distinctUntilChanged, map, switchMap } from "rxjs/operators";
import { BankAccountService } from "../bank-accounts/bank-account.service";
import { BudgetService } from "../budgets/budget.service";
import { TransactionSearchParams } from "./transaction-search-form/transaction-search-params.model";
import { TransactionService } from "./transaction.service";

@Injectable()
export class TransactionDataService {
  private searchParamsSubject = new Subject<TransactionSearchParams>();

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private bankAccountService: BankAccountService
  ) {}

  public init() {
    this.searchParamsSubject = new Subject<TransactionSearchParams>();
  }

  private searchParams$() {
    return this.searchParamsSubject.asObservable();
  }
  private budgetId$() {
    return this.searchParams$().pipe(map(params => params.budget_id));
  }

  private bankAccountId$() {
    return this.searchParams$().pipe(map(params => params.bank_account_id));
  }

  private distinctBankAccountId$() {
    return this.bankAccountId$().pipe(distinctUntilChanged());
  }

  private distinctBudgetId$() {
    return this.budgetId$().pipe(distinctUntilChanged());
  }

  public transactions$() {
    return this.searchParams$().pipe(
      switchMap(p => this.transactionService.getTransactions(p))
    );
  }

  public allocations$() {
    return this.budgetId$().pipe(
      switchMap(p => this.budgetService.getAllocations(p))
    );
  }

  public sinkFundAllocation$() {
    return this.distinctBankAccountId$().pipe(
      switchMap(p => this.bankAccountService.getSinkFundAllocations(p))
    );
  }

  public refresh(searchParams: TransactionSearchParams) {
    this.searchParamsSubject.next(searchParams);
  }

  public allData$() {
    return combineLatest(
      this.transactions$(),
      this.allocations$(),
      this.sinkFundAllocation$()
    );
  }

  destroy() {
    this.searchParamsSubject.complete();
  }
}
