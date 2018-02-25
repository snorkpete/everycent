import { Injectable } from '@angular/core';
import {ApiGateway} from '../../api/api-gateway.service';
import {Observable} from 'rxjs/Observable';
import {BankAccountData} from "../bank-accounts/bank-account.model";
import {BudgetData} from "../budgets/budget.model";
import {TransactionData} from './transaction-data.model';
import {TransactionSearchParams} from "./transaction-search-form/transaction-search-params.model";

@Injectable()
export class TransactionService {

  constructor(
    private apiGateway: ApiGateway
  ) { }


  getTransactions(searchParams: TransactionSearchParams = {}): Observable<TransactionData[]> {
    // remove unnecessary params
    let urlParams = Object.assign({no_bank_account: true}, searchParams);
    delete urlParams.budget;
    delete urlParams.bankAccount;
    return this.apiGateway.get('/transactions', urlParams);
  }

  save(transactions: TransactionData[], bankAccount: BankAccountData, budget: BudgetData): Observable<TransactionData[]> {

    let validTransactions = this.extractValidTransactionsInBudget(transactions, budget);
    let postParams = {
      bank_account_id: bankAccount.id,
      budget_id: budget.id,
      transactions: validTransactions
    };
    return this.apiGateway.post('/transactions', postParams);
  }

  extractValidTransactionsInBudget(transactions: TransactionData[], budget: BudgetData) {

    let startDate = new Date(budget.start_date);
    let endDate = new Date(budget.end_date);

    return transactions.filter(transaction => {

      let transactionDate;
      if (typeof transaction.transaction_date === 'string') {
        transactionDate = new Date(transaction.transaction_date);
      } else {
        transactionDate = transaction.transaction_date;
      }
      return !transaction.deleted && transactionDate >= startDate && transactionDate <= endDate;
    });
  }
}
