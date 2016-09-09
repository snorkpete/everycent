import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {routing} from "./account-balances.routing";
import {AccountBalancesComponent} from "./account-balances.component";
import {AccountBalancesService} from "./account-balances.service";

@NgModule({
  declarations:[
    AccountBalancesComponent,
  ],
  imports: [
    SharedModule,
    routing
  ],
  providers: [AccountBalancesService]
})
export class AccountBalancesModule{}
