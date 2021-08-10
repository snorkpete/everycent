import { NgModule } from "@angular/core";
import { SharedTransactionsModule } from "../shared-transactions/shared-transactions.module";
import { SharedModule } from "../shared/shared.module";
import { AddTransferFormComponent } from "./add-transfer-form/add-transfer-form.component";
import { SinkFundActionsComponent } from "./sink-fund-actions/sink-fund-actions.component";
import { SinkFundSelectorComponent } from "./sink-fund-selector/sink-fund-selector.component";
import { SinkFundService } from "./sink-fund.service";
import { SinkFundComponent } from "./sink-fund/sink-fund.component";
import { SinkFundsRoutingModule } from "./sink-funds-routing.module";
import { SinkFundsComponent } from "./sink-funds.component";

@NgModule({
  imports: [SharedModule, SharedTransactionsModule, SinkFundsRoutingModule],
  declarations: [
    SinkFundsComponent,
    SinkFundComponent,
    SinkFundActionsComponent,
    AddTransferFormComponent,
    SinkFundSelectorComponent
  ],
  providers: [SinkFundService]
})
export class SinkFundsModule {}
