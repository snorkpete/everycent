import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs/Subject";
import { MessageService } from "../../message-display/message.service";
import { MainToolbarService } from "../../shared/main-toolbar/main-toolbar.service";
import { BudgetData } from "../budget.model";
import { BudgetService } from "../budget.service";

@Component({
  selector: "ec-budget",
  template: `
    <mat-card>
      <mat-card-actions fxLayoutGap="10px" align="end">
        <button mat-raised-button (click)="goToBudgetList()">&laquo; Back to Budget List</button>
        <button mat-raised-button (click)="goToTransactions()">View Transactions</button>
      </mat-card-actions>
      <mat-card-content>
        <ec-budget-editor [budget]="budget" [editMode]="editMode">

        </ec-budget-editor>
      </mat-card-content>
      <ec-edit-actions [(editMode)]="editMode" (save)="saveBudget()" (cancel)="cancel()">
      </ec-edit-actions>
    </mat-card>
  `,
  styles: []
})
export class BudgetComponent implements OnInit, OnDestroy {
  budget: BudgetData = {};
  componentDestroyed$ = new Subject();
  editMode = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute,
    private budgetService: BudgetService,
    private toolbar: MainToolbarService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap
      .takeUntil(this.componentDestroyed$)
      .map(paramMap => Number(paramMap.get("id")))
      .switchMap(budgetId => this.budgetService.getBudget(budgetId))
      .subscribe(budget => {
        this.budget = budget;
        this.updateHeading();
      });
  }

  private updateHeading() {
    this.toolbar.setHeading(`Edit Budget: ${this.budget.name}`);
  }

  private refresh() {
    this.budgetService
      .getBudget(this.budget.id)
      .subscribe(budget => (this.budget = budget));
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  goToBudgetList() {
    this.router.navigate([".."], { relativeTo: this.route });
  }

  goToTransactions() {
    this.router.navigate(
      ["..", "transactions", { budget_id: this.budget.id }],
      { relativeTo: this.route.parent.parent }
    );
  }

  saveBudget() {
    //TODO: to implement
    this.messageService.setMessage("Budget saved.");
  }

  cancel() {
    this.messageService.setMessage("Editing canceled");
    this.editMode = false;
    this.refresh();
  }
}
