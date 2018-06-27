import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import { BudgetData } from "../../budget.model";
import { FutureBudgetsDataFormatterService } from "../future-budgets-data-formatter.service";
import {MatDialog, MatDialogRef} from "@angular/material";
import {BudgetMassEditFormComponent} from "../mass-edit/budget-mass-edit-form.component";

@Component({
  /* tslint:disable component-selector */
  selector: "[ec-future-income-list]",
  template: `
      <tr class="section-heading">
        <td [attr.colspan]="nbrOfColumns()">
          Incomes
        </td>
      </tr>
      <tr class="heading">
        <th>Income</th>
        <th *ngFor="let budget of budgets; trackBy: trackById">
          <a [routerLink]="['..', budget.id]"> {{budget.name}}</a>
        </th>
      </tr>
      <tr *ngFor="let incomeName of incomeNames">
        <td><a (click)="massEditIncome(incomeName)">{{incomeName}}</a></td>
        <td *ngFor="let budget of budgets; trackBy: trackById" class="right">
          {{ getAmountForIncomeAndBudget(incomeName, budget).amount | ecMoney }}
        </td>
      </tr>
      <tr class="total">
        <th>Total Income</th>
        <th *ngFor="let budget of budgets" class="right">
           {{ totalFor(budget.name) | ecMoney }}
        </th>
      </tr>
  `,
  styles: [
    `
    a {
      cursor: pointer;
      text-decoration: none;
      color: rgba(0,0,0,.74);
    }
    a:hover {
      text-decoration: underline;
      color: blue;
    }
  `
  ]
})
export class FutureIncomeListComponent implements OnInit {
  @Output() save = new EventEmitter();
  @Input()
  get budgets(): BudgetData[] {
    return this._budgets;
  }

  set budgets(newBudgetList: BudgetData[]) {
    this._budgets = newBudgetList;
    this.updateDisplayData();
  }
  _budgets: BudgetData[] = [];
  displayData: any = {};
  incomeNames: string[] = [];
  dialogRef: MatDialogRef<BudgetMassEditFormComponent>;

  constructor(private formatter: FutureBudgetsDataFormatterService, private dialog: MatDialog) {}

  ngOnInit() {}

  nbrOfColumns() {
    return this.budgets.length + 1;
  }

  updateDisplayData() {
    this.displayData = this.formatter.formatIncomesForDisplay(this.budgets);
    this.incomeNames = Object.keys(this.displayData);
  }

  getAmountForIncomeAndBudget(incomeName: string, budget: BudgetData) {
    let data = (this.displayData[incomeName] &&
      this.displayData[incomeName][budget.name]) || { id: 0, amount: 0 };

    return data;
  }

  totalFor(budgetName: string) {
    let incomes = Object.keys(this.displayData).map(
      income => this.displayData[income]
    );

    return this.totalByBudget(incomes, budgetName);
  }

  totalByBudget(incomes, budgetName): number {
    return incomes.reduce((sum, income) => {
      // skip any items that don't have the property
      if (!income[budgetName]) {
        return sum;
      }

      return sum + (income[budgetName] && income[budgetName].amount);
    }, 0);
  }

  trackById(index: number, budget: BudgetData) {
    return budget.id;
  }

  massEditIncome(incomeName: string) {
    this.dialogRef = this.dialog.open(BudgetMassEditFormComponent, {
      maxHeight: 600
    });

    const form = this.dialogRef.componentInstance;
    form.name = incomeName;
    form.displayData = this.displayData[incomeName];
    form.budgets = this.budgets;
    form.bank_account_id = 0;
    form.createFormForIncomes();

    form.save.subscribe(massEditData => this.save.emit(massEditData));
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
