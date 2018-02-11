import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MessageService} from "../../message-display/message.service";
import {MainToolbarService} from "../../shared/main-toolbar/main-toolbar.service";
import {BudgetData} from "../budget.model";
import {BudgetService} from "../budget.service";

@Component({
  selector: 'ec-budgets',
  template: `
    <mat-card>
      <mat-card-title>Budgets</mat-card-title>
      <mat-card-content>
        <ec-budget-list [budgets]="budgets"
                        (select)="goToBudget($event)"
                        (close)="closeBudget($event)"
                        (copy)="copyBudget($event)"
        ></ec-budget-list>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="addNewBudget()">Add New Budget</button>
        <button mat-raised-button color="warn" (click)="reopenLastBudget()">Reopen Last Budget</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: []
})
export class BudgetsComponent implements OnInit {

  budgets: BudgetData[];

  constructor(
    private toolbar: MainToolbarService,
    private budgetService: BudgetService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.toolbar.setHeading('Budgets');

    this.budgetService.getBudgets().subscribe(budgets => this.budgets = budgets );
  }

  addNewBudget() {
    //TODO: to implement
    this.messageService.setMessage("Adding not yet implemented - copy previous budget for now");
  }

  reopenLastBudget() {
    //TODO: to implement
    this.messageService.setMessage("Reopen not yet implemented - use old version for now");
  }

  goToBudget(budget: BudgetData) {
    this.router.navigate([budget.id], { relativeTo: this.route });
  }

  closeBudget(budget: BudgetData) {
    //TODO: to implement
    this.messageService.setMessage("Close not yet implemented");
  }

  copyBudget(budget: BudgetData) {
    //TODO: to implement
    this.messageService.setMessage("Copy not yet implemented");
  }
}
