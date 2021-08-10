import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { AccountBalanceTotalsComponent } from "./account-balance-totals/account-balance-totals.component";
import { AccountBalancesRoutingModule } from "./account-balances-routing.module";
import { AccountBalancesService } from "./account-balances.service";
import { AccountBalancesComponent } from "./account-balances/account-balances.component";
import { AccountListComponent } from "./account-list/account-list.component";
import { AdjustBalancesComponent } from "./adjust-balances/adjust-balances.component";

@NgModule({
  imports: [CommonModule, SharedModule, AccountBalancesRoutingModule],
  declarations: [
    AccountBalancesComponent,
    AccountListComponent,
    AccountBalanceTotalsComponent,
    AdjustBalancesComponent
  ],
  providers: [AccountBalancesService]
})
export class AccountBalancesModule {}
