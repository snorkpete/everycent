import { NgModule } from "@angular/core";
import { SharedTransactionsModule } from "../shared-transactions/shared-transactions.module";
import { SharedModule } from "../shared/shared.module";
import { TransactionImporterModule } from "./importers/transaction-importer.module";
import { TransactionDataService } from "./transaction-data.service";
import { TransactionDateValidatorDirective } from "./transaction-date-validator.directive";
import { TransactionListComponent } from "./transaction-list/transaction-list.component";
import { TransactionSearchFormComponent } from "./transaction-search-form/transaction-search-form.component";
import { TransactionSummaryComponent } from "./transaction-summary/transaction-summary.component";
import { TransactionService } from "./transaction.service";
import { TransactionsRoutingModule } from "./transactions-routing.module";
import { TransactionsComponent } from "./transactions/transactions.component";
import { TransactionCalculatorComponent } from "./transaction-calculator/transaction-calculator.component";
import { TransactionTransferModule } from "./transfer/transaction-transfer.module";

@NgModule({
  imports: [
    SharedModule,
    SharedTransactionsModule,
    TransactionImporterModule,
    TransactionTransferModule,
    TransactionsRoutingModule
  ],
  declarations: [
    TransactionsComponent,
    TransactionDateValidatorDirective,
    TransactionListComponent,
    TransactionSearchFormComponent,
    TransactionSummaryComponent,
    TransactionCalculatorComponent
  ],
  providers: [TransactionService, TransactionDataService]
})
export class TransactionsModule {}
