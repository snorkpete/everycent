import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AuthShellComponent } from "./auth-shell.component";
import { LoginComponent } from "./login/login.component";
import { HomeComponent } from "./home/home.component";
import { AuthGuard } from "./core/auth/auth-guard.service";

const appRoutes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "logout", redirectTo: "login" },
  {
    path: "",
    component: AuthShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "", component: HomeComponent },
      {
        path: "budgets",
        loadChildren: () =>
          import("app/budgets/budgets.module").then(m => m.BudgetsModule)
      },
      {
        path: "transactions",
        loadChildren: () =>
          import("app/transactions/transactions.module").then(
            m => m.TransactionsModule
          )
      },
      {
        path: "sink-funds",
        loadChildren: () =>
          import("app/sink-funds/sink-funds.module").then(
            m => m.SinkFundsModule
          )
      },
      {
        path: "account-balances",
        loadChildren: () =>
          import("app/account-balances/account-balances.module").then(
            m => m.AccountBalancesModule
          )
      },
      {
        path: "reports",
        loadChildren: () =>
          import("app/reporting/reporting.module").then(m => m.ReportingModule)
      },
      {
        path: "setup",
        loadChildren: () =>
          import("app/setup/setup.module").then(m => m.SetupModule)
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      useHash: true,
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
