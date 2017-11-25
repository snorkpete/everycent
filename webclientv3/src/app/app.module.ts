import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';

import {CoreModule} from "./core/core.module";
import {AppComponent} from './app.component';

import {SharedModule} from './shared/shared.module';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {AppRoutingModule} from "./app-routing.module";
import {SinkFundsModule} from './sink-funds/sink-funds.module';
import {AccountBalancesModule} from "./account-balances/account-balances.module";
import {BudgetsModule} from "./budgets/budgets.module";
import {BankAccountsModule} from "./bank-accounts/bank-accounts.module";

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    CoreModule,
    SharedModule,

    // main routing module
    AppRoutingModule,

    // feature modules
    AccountBalancesModule,
    BankAccountsModule,
    BudgetsModule,
    SinkFundsModule,
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
