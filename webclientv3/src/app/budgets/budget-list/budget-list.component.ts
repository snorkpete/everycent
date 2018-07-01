import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BudgetData } from "../budget.model";

@Component({
  selector: "ec-budget-list",
  template: `
    <mat-card>
      <mat-card-content>
        <mat-list>
          <ng-container *ngFor="let budget of budgets">
            <mat-list-item>
              <h1 matLine> {{budget.name}} </h1>
              <div matLine fxFlexLayout="row" fxLayoutGap="10px" fxLayoutAlign="end">
                <button mat-raised-button color="primary" (click)="select.emit(budget)">View</button>
                <button *ngIf="canCopy(budget)" mat-raised-button color="accent" (click)="copy.emit(budget)">Copy</button>
                <button *ngIf="canClose(budget)" mat-raised-button color="warn" (click)="close.emit(budget)">Close</button>
              </div>
            </mat-list-item>
            <mat-divider></mat-divider>
            </ng-container>
        </mat-list>
        </mat-card-content>
    </mat-card>
  `,
  styles: []
})
export class BudgetListComponent implements OnInit {
  @Input() budgets: BudgetData[];
  @Output() select = new EventEmitter<BudgetData>();
  @Output() close = new EventEmitter<BudgetData>();
  @Output() copy = new EventEmitter<BudgetData>();

  constructor() {}

  ngOnInit() {}

  canCopy(budget: BudgetData): boolean {
    const firstBudget = this.budgets[0];
    return firstBudget && firstBudget.id === budget.id;
  }

  canClose(budget: BudgetData): boolean {
    const openBudgets = this.budgets.filter(b => b.status === "open");
    if (openBudgets.length === 0) {
      return false;
    }
    const lastOpenBudget = openBudgets[openBudgets.length - 1];
    return lastOpenBudget && budget.id === lastOpenBudget.id;
  }
}
