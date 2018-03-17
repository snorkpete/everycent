import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {AuthGuard} from './core/auth/auth-guard.service';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', redirectTo: 'login' },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {path: '', component: HomeComponent},
      {path: 'budgets', loadChildren: 'app/budgets/budgets.module#BudgetsModule'},
      {path: 'transactions', loadChildren: 'app/transactions/transactions.module#TransactionsModule'},
      {path: 'sink-funds', loadChildren: 'app/sink-funds/sink-funds.module#SinkFundsModule'},
      {path: 'account-balances', loadChildren: 'app/account-balances/account-balances.module#AccountBalancesModule'},
      {path: 'setup', loadChildren: 'app/setup/setup.module#SetupModule'},
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      useHash: true,
      preloadingStrategy: PreloadAllModules
    }),
  ],
  exports: [
    RouterModule,
  ]

})
export class AppRoutingModule {}
