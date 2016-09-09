
import {Routes, RouterModule} from "@angular/router";
import {ModuleWithProviders} from "@angular/core";
import {AccountBalancesComponent} from "./account-balances.component";
import {MenuOption} from "../shared/menu-option.model";
import {Icons} from '../shared/icons.constants';

const routes: Routes = [
  { path: 'account-balances', component: AccountBalancesComponent }
];

export const accountBalancesMenuOptions: MenuOption[] = [
  { path: 'account-balances', label: 'Account Balances', icon: Icons.ACCOUNT_BALANCE}
];

export const accountBalancesRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
