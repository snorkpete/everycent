import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {ApiGateway} from "../../api/api-gateway.service";
import {BankAccountService} from "../bank-accounts/bank-account.service";
import {BudgetService} from "../budgets/budget.service";
import {AllocationData} from "./allocation-data.model";
import {TransactionSearchParams} from "./transaction-search-form/transaction-search-params.model";
import {TransactionService} from "./transaction.service";

@Injectable()
export class TransactionDataService {

  private searchParamsSubject = new Subject<TransactionSearchParams>();

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private bankAccountService: BankAccountService
  ) { }

  public init() {
   this.searchParamsSubject = new Subject<TransactionSearchParams>();
  }

  private searchParams$() {
    return this.searchParamsSubject.asObservable();
  }
  private budgetId$() {
    return this.searchParams$().map(params => params.budget_id);
  }

  private bankAccountId$() {
    return this.searchParams$().map(params => params.bank_account_id);
  }

  private distinctBankAccountId$() {
    return this.bankAccountId$().distinctUntilChanged();
  }

  private distinctBudgetId$() {
    return this.budgetId$().distinctUntilChanged();
  }

  public transactions$() {
    return this.searchParams$().switchMap(p => this.transactionService.getTransactions(p));
  }

  public allocations$() {
    return this.distinctBudgetId$().switchMap(p => this.budgetService.getAllocations(p));
  }

  public sinkFundAllocation$() {
    return this.distinctBankAccountId$().switchMap(p => this.bankAccountService.getSinkFundAllocations(p));
  }

  public refresh(searchParams: TransactionSearchParams) {
    this.searchParamsSubject.next(searchParams);
  }

  public allData$() {
    return Observable.combineLatest(this.transactions$(), this.allocations$(), this.sinkFundAllocation$());
  }

  destroy() {
    this.searchParamsSubject.complete();
  }

}
