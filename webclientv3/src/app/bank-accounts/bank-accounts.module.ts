import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BankAccountsRoutingModule } from './bank-accounts-routing.module';
import {BankAccountService} from "./bank-account.service";

@NgModule({
  imports: [
    CommonModule,
    BankAccountsRoutingModule
  ],
  declarations: [],
  providers: [
    BankAccountService,
  ]
})
export class BankAccountsModule { }
