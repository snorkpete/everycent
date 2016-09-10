import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {routing} from "./account-balances.routing";
import {AccountBalancesComponent} from "./account-balances.component";
import {AccountBalanceListComponent} from "./account-balance-list.component";
import {AccountBalancesService} from "./account-balances.service";

@NgModule({
  declarations:[
    AccountBalancesComponent,
    AccountBalanceListComponent
  ],
  imports: [
    SharedModule,
    routing
  ],
  providers: [AccountBalancesService]
})
export class AccountBalancesModule{}
