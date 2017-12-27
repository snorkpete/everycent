import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {CompactTransactionListComponent} from './compact-transaction-list/compact-transaction-list.component';
import {TransactionImporterModule} from "./importers/transaction-importer.module";
import {TransactionDataService} from "./transaction-data.service";
import {TransactionListRowComponent} from "./transaction-list/transaction-list-row.component";
import {TransactionService} from './transaction.service';
import { TransactionsComponent } from './transactions/transactions.component';
import {TransactionsRoutingModule} from "./transactions-routing.module";
import { TransactionSearchFormComponent } from './transaction-search-form/transaction-search-form.component';
import { TransactionSummaryComponent } from './transaction-summary/transaction-summary.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import {TransactionListHeaderComponent} from "./transaction-list/transaction-list-header.component";
import { TransactionDateValidatorDirective } from './transaction-date-validator.directive';

@NgModule({
  imports: [
    SharedModule,
    TransactionImporterModule,
    TransactionsRoutingModule,
  ],
  declarations: [
    TransactionsComponent,
    CompactTransactionListComponent,
    TransactionDateValidatorDirective,
    TransactionListComponent,
    TransactionListHeaderComponent,
    TransactionListRowComponent,
    TransactionSearchFormComponent,
    TransactionSummaryComponent,
  ],
  exports: [
    CompactTransactionListComponent,
  ],
  entryComponents: [
    CompactTransactionListComponent,
  ],
  providers: [
    TransactionService,
    TransactionDataService,
  ]
})
export class TransactionsModule { }
