import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from "../core/auth/auth-guard.service";
import {BudgetComponent} from "./budget/budget.component";
import {BudgetsComponent} from "./budgets/budgets.component";
import {FutureBudgetsComponent} from "./future-budgets/future-budgets.component";

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'future', component: FutureBudgetsComponent },
      { path: ':id', component: BudgetComponent },
      { path: '', component: BudgetsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BudgetsRoutingModule { }
