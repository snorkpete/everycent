import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { filter, map, switchMap, takeUntil } from "rxjs/operators";
import { MessageService } from "../../message-display/message.service";
import { MainToolbarService } from "../../shared/main-toolbar/main-toolbar.service";
import { BudgetData } from "../budget.model";
import { BudgetService } from "../budget.service";

@Component({
  selector: "ec-budget",
  template: `
    <mat-card class="main">
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
    let idParam$ = this.activatedRoute.paramMap.pipe(
      takeUntil(this.componentDestroyed$),
      map(paramMap => paramMap.get("id"))
    );

    // check for the 'current' route
    idParam$
      .pipe(
        filter(id => id === "current"),
        switchMap(() => this.budgetService.getCurrentBudgetId())
      )
      .subscribe((budgetId: number) => {
        this.router.navigateByUrl(`/budgets/${budgetId}`);
      });

    // for all other routes, load the budget
    this.loadBudgetForId(idParam$);
  }

  private loadBudgetForId(idParam$: Observable<string>) {
    idParam$
      .pipe(
        filter(id => id !== "current"),
        map(idString => Number(idString)),
        switchMap(budgetId => this.budgetService.getBudget(budgetId))
      )
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
    this.budgetService.saveBudget(this.budget).subscribe(budget => {
      this.budget = budget;
      this.messageService.setMessage("Budget saved.");
      this.editMode = false;
    });
  }

  cancel() {
    this.messageService.setMessage("Editing canceled");
    this.editMode = false;
    this.refresh();
  }
}
