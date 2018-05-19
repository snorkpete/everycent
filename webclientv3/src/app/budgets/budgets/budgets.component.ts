import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "../../message-display/message.service";
import { ConfirmationService } from "../../shared/confirmation.service";
import { ConfirmationComponent } from "../../shared/confirmation/confirmation.component";
import { MainToolbarService } from "../../shared/main-toolbar/main-toolbar.service";
import { AddBudgetComponent } from "../add-budget/add-budget.component";
import { BudgetData } from "../budget.model";
import { BudgetService } from "../budget.service";

@Component({
  selector: "ec-budgets",
  template: `
    <mat-card class="main">
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
    private route: ActivatedRoute,
    private confirmation: ConfirmationService
  ) { }

  ngOnInit() {
    this.toolbar.setHeading("Budgets");
    this.refresh();
  }

  refresh() {
    this.budgetService
      .getBudgets()
      .subscribe(budgets => (this.budgets = budgets));
  }

  addNewBudget() {
    //TODO: to implement
    this.messageService.setMessage("Adding not yet implemented - copy previous budget for now");
  }

  reopenLastBudget() {
    this.confirmation
      .ask({
        title: "Reopen Last Budget",
        question: "Are you sure you want to open the last closed budget?",
        emitNegativeAnswers: false
      })
      .subscribe(() => {
        this.messageService.setMessage("Reopening last budget...");
        this.budgetService.reopenLastBudget().subscribe(() => {
          this.messageService.setMessage("Last Budget re-opened.");
          this.refresh();
        });
      });
  }

  goToBudget(budget: BudgetData) {
    this.router.navigate([budget.id], { relativeTo: this.route });
  }

  closeBudget(budget: BudgetData) {
    this.confirmation
      .ask({
        title: "Close Budget Period?",
        question: "Are you ready to close off this budget?",
        emitNegativeAnswers: false
      })
      .subscribe(() => {
        this.messageService.setMessage("Closing....");
        this.budgetService.closeBudget(budget).subscribe(
          () => {
            this.messageService.setMessage("Budget closed.");
            this.refresh();
          },
          () => {
            this.messageService.setErrorMessage("Budget NOT closed.");
          }
        );
      });
  }

  copyBudget(budget: BudgetData) {
    this.confirmation
      .ask({
        title: "Copy Budget?",
        question: "Are you sure you want to COPY this budget?",
        emitNegativeAnswers: false
      })
      .subscribe(() => {
        this.messageService.setMessage("Copying...");
        this.budgetService.copyBudget(budget).subscribe(
          () => {
            this.messageService.setMessage("Budget copied.");
            this.refresh();
          },
          () => {
            this.messageService.setErrorMessage("Budget NOT copied.");
          }
        );
      });
  }
}
