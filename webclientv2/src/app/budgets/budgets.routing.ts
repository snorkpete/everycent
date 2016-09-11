

import {Routes, RouterModule} from "@angular/router";
import {ModuleWithProviders} from "@angular/core";
import {MenuOption} from "../shared/menu-option.model";
import {Icons} from "../shared/icons.constants";
import {BudgetsComponent} from "./budgets.component";

const routes: Routes = [
  { path: 'budgets', component: BudgetsComponent}
];

export const budgetsMenuOptions: MenuOption[] = [
  { path: '/budgets', label: 'Budgets', icon: Icons.BUDGET}
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
