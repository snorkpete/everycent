import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {CompactTransactionListComponent} from './compact-transaction-list/compact-transaction-list.component';
import {TransactionService} from './transaction.service';
import { TransactionsComponent } from './transactions/transactions.component';
import {TransactionsRoutingModule} from "./transactions-routing.module";
import { TransactionSearchFormComponent } from './transaction-search-form/transaction-search-form.component';
import { TransactionSummaryComponent } from './transaction-summary/transaction-summary.component';

@NgModule({
  imports: [
    SharedModule,
    TransactionsRoutingModule,
  ],
  declarations: [
    TransactionsComponent,
    CompactTransactionListComponent,
    TransactionSearchFormComponent,
    TransactionSummaryComponent,
    TransactionListComponent,
  ],
  exports: [
    CompactTransactionListComponent,
  ],
  entryComponents: [
    CompactTransactionListComponent,
  ],
  providers: [
    TransactionService,
  ]
})
export class TransactionsModule { }
