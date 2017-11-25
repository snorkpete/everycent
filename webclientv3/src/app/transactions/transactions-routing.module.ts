import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {TransactionsComponent} from "./transactions/transactions.component";
import {AuthGuard} from "../core/auth/auth-guard.service";

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'transactions', component: TransactionsComponent },
    ]
  }
]
@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]

})
export class TransactionsRoutingModule{}
