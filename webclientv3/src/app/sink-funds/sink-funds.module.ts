import {NgModule} from '@angular/core';
import {SinkFundsRoutingModule} from './sink-funds-routing.module';
import {SinkFundsComponent} from './sink-funds.component';
import {SharedModule} from '../shared/shared.module';
import { SinkFundComponent } from './sink-fund/sink-fund.component';
import {SinkFundService} from './sink-fund.service';

@NgModule({
  imports: [
    SharedModule,
    SinkFundsRoutingModule
  ],
  declarations: [
    SinkFundsComponent,
    SinkFundComponent,
  ],
  providers: [
    SinkFundService,
  ]
})
export class SinkFundsModule { }
