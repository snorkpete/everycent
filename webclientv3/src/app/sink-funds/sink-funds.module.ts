import {NgModule} from '@angular/core';
import {SinkFundsRoutingModule} from './sink-funds-routing.module';
import {SinkFundsComponent} from './sink-funds.component';
import {SharedModule} from '../shared/shared.module';
import { SinkFundComponent } from './sink-fund/sink-fund.component';
import {SinkFundService} from './sink-fund.service';
import { SinkFundActionsComponent } from './sink-fund-actions/sink-fund-actions.component';
import { AddTransferFormComponent } from './add-transfer-form/add-transfer-form.component';

@NgModule({
  imports: [
    SharedModule,
    SinkFundsRoutingModule
  ],
  declarations: [
    SinkFundsComponent,
    SinkFundComponent,
    SinkFundActionsComponent,
    AddTransferFormComponent,
  ],
  entryComponents: [
    AddTransferFormComponent,
  ],
  providers: [
    SinkFundService,
  ]
})
export class SinkFundsModule { }
