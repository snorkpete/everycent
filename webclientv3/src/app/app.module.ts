import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {ApiModule} from "../api/api.module";
import {SharedModule} from './shared/shared.module';
import {RouterModule} from '@angular/router';
import {MaterialModule} from '@angular/material';
import {AppRoutingModule} from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import {SinkFundsModule} from './sink-funds/sink-funds.module';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

    ApiModule,
    SharedModule,

    // feature modules
    SinkFundsModule,
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
