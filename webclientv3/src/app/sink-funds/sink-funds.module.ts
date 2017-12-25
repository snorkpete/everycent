import {NgModule} from '@angular/core';
import {SinkFundsRoutingModule} from './sink-funds-routing.module';
import {SinkFundsComponent} from './sink-funds.component';
import {SharedModule} from '../shared/shared.module';
import {SinkFundComponent} from './sink-fund/sink-fund.component';
import {SinkFundService} from './sink-fund.service';
import {SinkFundActionsComponent} from './sink-fund-actions/sink-fund-actions.component';
import {AddTransferFormComponent} from './add-transfer-form/add-transfer-form.component';
import {TransactionsModule} from '../transactions/transactions.module';
import { SinkFundSelectorComponent } from './sink-fund-selector/sink-fund-selector.component';

@NgModule({
  imports: [
    SharedModule,
    SinkFundsRoutingModule,

    // TODO: not sure i like this - might want to create a shared transactions module
    TransactionsModule,
  ],
  declarations: [
    SinkFundsComponent,
    SinkFundComponent,
    SinkFundActionsComponent,
    AddTransferFormComponent,
    SinkFundSelectorComponent,
  ],
  entryComponents: [
    AddTransferFormComponent,
  ],
  providers: [
    SinkFundService,
  ]
})
export class SinkFundsModule { }
