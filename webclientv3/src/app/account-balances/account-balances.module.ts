import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from "../shared/shared.module";
import {AccountBalancesRoutingModule} from "./account-balances-routing.module";
import { AccountBalancesComponent } from './account-balances/account-balances.component';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountBalanceTotalsComponent } from './account-balance-totals/account-balance-totals.component';
import {AccountBalancesService} from "./account-balances.service";
import {AccountListHeaderComponent} from "./account-list/account-list-header.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,

    AccountBalancesRoutingModule,
  ],
  declarations: [
    AccountBalancesComponent,
    AccountListComponent,
    AccountListHeaderComponent,
    AccountBalanceTotalsComponent,
  ],
  providers: [
    AccountBalancesService,
  ]

})
export class AccountBalancesModule { }
