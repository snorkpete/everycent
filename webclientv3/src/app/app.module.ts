import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BankAccountsModule } from "./bank-accounts/bank-accounts.module";
import { BudgetsModule } from "./budgets/budgets.module";

import { CoreModule } from "./core/core.module";
import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./login/login.component";

import { SharedModule } from "./shared/shared.module";
import { AuthShellComponent } from "./auth-shell.component";
import { WeeklyBudgetComponent } from "./budgets/weekly-budget/weekly-budget.component";

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    CoreModule,
    SharedModule,

    // main routing module
    AppRoutingModule,

    // feature modules
    BankAccountsModule,
    BudgetsModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    AuthShellComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
