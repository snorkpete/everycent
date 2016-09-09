import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {routing} from "./account-balances.routing";
import {AccountBalancesListComponent} from "./account-balances-list.component";

@NgModule({
  declarations:[
    AccountBalancesListComponent
  ],
  imports: [
    SharedModule,
    routing
  ]
})
export class AccountBalancesModule{}
