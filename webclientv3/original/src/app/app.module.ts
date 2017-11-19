import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {ApiModule} from '../api/api.module';
import {SharedModule} from './shared/shared.module';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {SinkFundsModule} from './sink-funds/sink-funds.module';
import {AccountBalancesModule} from "./account-balances/account-balances.module";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

    ApiModule,
    SharedModule,

    // feature modules
    SinkFundsModule,
    AccountBalancesModule,
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
