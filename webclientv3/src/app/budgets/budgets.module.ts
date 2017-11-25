import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BudgetsRoutingModule } from './budgets-routing.module';
import {BudgetService} from "./budget.service";

@NgModule({
  imports: [
    CommonModule,
    BudgetsRoutingModule
  ],
  declarations: [],
  providers: [
    BudgetService,
  ]
})
export class BudgetsModule { }
