import {NgModule} from '@angular/core';
import {SharedTransactionsModule} from "../shared-transactions/shared-transactions.module";
import {SharedModule} from '../shared/shared.module';
import {TransactionImporterModule} from "./importers/transaction-importer.module";
import {TransactionDataService} from "./transaction-data.service";
import {TransactionDateValidatorDirective} from './transaction-date-validator.directive';
import {TransactionListHeaderComponent} from "./transaction-list/transaction-list-header.component";
import {TransactionListRowComponent} from "./transaction-list/transaction-list-row.component";
import {TransactionListComponent} from './transaction-list/transaction-list.component';
import {TransactionSearchFormComponent} from './transaction-search-form/transaction-search-form.component';
import {TransactionSummaryComponent} from './transaction-summary/transaction-summary.component';
import {TransactionService} from './transaction.service';
import {TransactionsRoutingModule} from "./transactions-routing.module";
import {TransactionsComponent} from './transactions/transactions.component';

@NgModule({
  imports: [
    SharedModule,
    SharedTransactionsModule,
    TransactionImporterModule,
    TransactionsRoutingModule,
  ],
  declarations: [
    TransactionsComponent,
    TransactionDateValidatorDirective,
    TransactionListComponent,
    TransactionListHeaderComponent,
    TransactionListRowComponent,
    TransactionSearchFormComponent,
    TransactionSummaryComponent,
  ],
  providers: [
    TransactionService,
    TransactionDataService,
  ]
})
export class TransactionsModule { }
