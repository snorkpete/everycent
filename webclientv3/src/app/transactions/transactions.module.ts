import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {TransactionListComponent} from './transaction-list/transaction-list.component';
import {TransactionService} from './transaction.service';

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    TransactionListComponent,
  ],
  exports: [
    TransactionListComponent,
  ],
  entryComponents: [
    TransactionListComponent,
  ],
  providers: [
    TransactionService,
  ]
})
export class TransactionsModule { }
