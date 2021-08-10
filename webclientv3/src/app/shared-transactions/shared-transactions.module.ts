import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { CompactTransactionListComponent } from "./compact-transaction-list/compact-transaction-list.component";
import { SharedTransactionService } from "./shared-transaction.service";

@NgModule({
  imports: [SharedModule],
  declarations: [CompactTransactionListComponent],
  exports: [CompactTransactionListComponent],
  providers: [SharedTransactionService]
})
export class SharedTransactionsModule {}
