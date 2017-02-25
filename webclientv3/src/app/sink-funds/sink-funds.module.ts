import {NgModule} from '@angular/core';
import {SinkFundsRoutingModule} from './sink-funds-routing.module';
import {SinkFundsComponent} from './sink-funds.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    SinkFundsRoutingModule
  ],
  declarations: [SinkFundsComponent]
})
export class SinkFundsModule { }
