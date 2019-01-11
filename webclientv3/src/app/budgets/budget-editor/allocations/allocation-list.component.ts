import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef, MatTable } from "@angular/material";
import { CompactTransactionListComponent } from "../../../shared-transactions/compact-transaction-list/compact-transaction-list.component";
import { SharedTransactionService } from "../../../shared-transactions/shared-transaction.service";
import { Icon } from "../../../shared/ec-icon/icon.type";
import { total } from "../../../util/total";
import { AllocationData } from "../../allocation.model";
import { BudgetData } from "../../budget.model";
import { BudgetService } from "../../budget.service";

@Component({
  selector: "ec-allocation-list",
  template: `
    <h1>Allocations</h1>
    <table mat-table [multiTemplateDataRows]="true" [dataSource]="budget.allocations" [trackBy]="trackAllocation" class="mat-elevation-z8">

      <!-- ALLOCATION COLUMNS -->
      <!-- Name Column -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef style="width:25%;"> Name </th>
        <td mat-cell *matCellDef="let allocation">
          <ec-text-field [(ngModel)]="allocation.name" [editMode]="editMode"></ec-text-field>
        </td>
        <td mat-footer-cell *matFooterCellDef> Total </td>
      </ng-container>

      <!-- Amount Column -->
      <ng-container matColumnDef="amount">
        <th mat-header-cell *matHeaderCellDef style="width:10%;" class="right"> Amount </th>
        <td mat-cell *matCellDef="let allocation" class="right">
          <ec-money-field [(ngModel)]="allocation.amount" [editMode]="editMode"></ec-money-field>
        </td>
        <td mat-footer-cell *matFooterCellDef class="right">
          <ec-money-field [value]="totalAmount()"></ec-money-field>
        </td>
      </ng-container>

      <!-- Spent Column -->
      <ng-container matColumnDef="spent">
        <th mat-header-cell *matHeaderCellDef style="width:10%;" class="right"> Spent </th>
        <td mat-cell *matCellDef="let allocation" class="right">
          <div fxLayout="row" fxLayoutAlign="start center">
            <ec-icon [icon]="Icon.SHOW_TRANSACTIONS"
                     (click)="showTransactionsFor(allocation)"
                     class="small">
            </ec-icon>
            <span fxFlex></span>
            <ec-money-field [value]="allocation.spent"></ec-money-field>
          </div>
        </td>
        <td mat-footer-cell *matFooterCellDef class="right">
          <ec-money-field [value]="totalSpent()"></ec-money-field>
        </td>
      </ng-container>

      <!-- Remaining Column -->
      <ng-container matColumnDef="remaining">
        <th mat-header-cell *matHeaderCellDef style="width:10%;" class="right"> Remaining </th>
        <td mat-cell *matCellDef="let allocation" class="right">
          <ec-money-field [value]="allocation.amount - allocation.spent" [highlightPositive]="true"></ec-money-field>
        </td>
        <td mat-footer-cell *matFooterCellDef class="right">
          <ec-money-field [value]="totalRemaining()" [highlightPositive]="true"></ec-money-field>
        </td>
      </ng-container>

      <!-- Allocation Class Column -->
      <ng-container matColumnDef="allocationClass">
        <th mat-header-cell *matHeaderCellDef style="width:10%;" class="center"> Class</th>
        <td mat-cell *matCellDef="let allocation">

          <span class="text-display" *ngIf="editMode; else textDisplay">
              <select [(ngModel)]="allocation.allocation_class">
                  <option *ngFor="let item of allocationClasses; trackBy: trackById" [value]="item.id">
                    {{item.name}}
                  </option>
              </select>
          </span>

          <ng-template #textDisplay>
              <span class="value">{{ allocation.allocation_class | titlecase }}</span>
          </ng-template>
        </td>
        <td mat-footer-cell *matFooterCellDef>
        </td>
      </ng-container>

      <!-- Is Fixed Amount Column -->
      <ng-container matColumnDef="isFixedAmount">
        <th mat-header-cell *matHeaderCellDef style="width:5%;" class="center">Fixed Amount?</th>
        <td mat-cell *matCellDef="let allocation">

          <mat-checkbox *ngIf="editMode; else textDisplay"
                        color="primary" [(ngModel)]="allocation.is_fixed_amount">
          </mat-checkbox>

          <ng-template #textDisplay>
            <span class="value">{{ (allocation.is_fixed_amount ? 'Yes' : 'No') }}</span>
          </ng-template>
        </td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>

      <!-- Comment Column -->
      <ng-container matColumnDef="comment">
        <th mat-header-cell *matHeaderCellDef style="width:25%;"> Comment</th>
        <td mat-cell *matCellDef="let allocation">
          <ec-text-field [(ngModel)]="allocation.comment" [editMode]="editMode"></ec-text-field>
        </td>
        <td mat-footer-cell *matFooterCellDef>
            <span class="label">
              Unallocated: {{ totalDiscretionaryAmount() | ecMoney }}
            </span>
        </td>
      </ng-container>

      <!-- Action Column -->
      <ng-container matColumnDef="action">
        <th mat-header-cell *matHeaderCellDef style="width:5%;"></th>
        <td mat-cell *matCellDef="let allocation">
          <ec-delete-button [item]="allocation" [editMode]="editMode"></ec-delete-button>
        </td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>

      <!-- CATEGORY COLUMNS -->
      <!-- Category Name Column -->
      <ng-container matColumnDef="categoryName">
        <td mat-cell *matCellDef="let allocation">{{ allocation.allocationCategory }} </td>
      </ng-container>

      <!-- Category Amount Column -->
      <ng-container matColumnDef="categoryAmount">
        <td mat-cell *matCellDef="let allocation" class="right">
          <ec-money-field [value]="totalAmountFor(allocation.allocation_category_id)"></ec-money-field>
        </td>
      </ng-container>

      <!-- Category Spent Column -->
      <ng-container matColumnDef="categorySpent">
        <td mat-cell *matCellDef="let allocation" class="right">
          <ec-money-field [value]="totalSpentFor(allocation.allocation_category_id)"></ec-money-field>
        </td>
      </ng-container>

      <!-- Category Remaining Column -->
      <ng-container matColumnDef="categoryRemaining">
        <td mat-cell *matCellDef="let allocation" class="right">
          <ec-money-field [value]="totalRemainingFor(allocation.allocation_category_id)" [highlightPositive]="true"></ec-money-field>
        </td>
      </ng-container>

      <!-- Category Remaining Column -->
      <ng-container matColumnDef="categoryRest">
        <td mat-cell *matCellDef="let allocation" class="right" colspan="4">
        </td>
      </ng-container>

      <!-- Add Allocation Column -->
      <ng-container matColumnDef="addAllocation">
        <td mat-cell *matCellDef="let allocation; let dataIndex=dataIndex;" colspan="8">
          <div class="category-button" *ngIf="editMode">
            <button mat-raised-button color="primary"
                    (click)="addAllocation(allocation.allocation_category_id, dataIndex)">
              Add {{allocation.allocationCategory}} Allocation
            </button>
          </div>
        </td>
      </ng-container>

      <!-- ROW definitions -->
      <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>

      <tr mat-row *matRowDef="let allocation; columns: categoryColumns; when: showCategoryRow; " class="heading"></tr>
      <tr mat-row *matRowDef="let allocation; columns: displayedColumns; when: showAllocationRow;"
          [ecHighlightDeletedFor]="allocation"></tr>
      <tr mat-row *matRowDef="let allocation; columns: ['addAllocation']; when: showAddAllocationRow;"></tr>

      <tr mat-footer-row *matFooterRowDef="displayedColumns; sticky: true" class="footer"></tr>
    </table>
    <ec-allocation-list-summary [budget]="budget"></ec-allocation-list-summary>
  `,
  styles: [
    `
    table {
      width: 100%;
      table-layout: fixed;
    }
    table td:first-of-type, table th:first-of-type {
        padding-left: 24px;
    }
    .heading {
      font-weight: bold;
      font-size: 16px;
      border-top: 3px solid blue;
      border-bottom: 2px solid blue;
    }
    .heading td.mat-cell {
      font-weight: bold;
      font-size: 18px;
      border-top: 3px solid blue;
      border-bottom: 2px solid blue;
    }
    .footer {
      font-weight: bold;
      font-size: 18px;
      border-top: 2px solid grey;
      border-bottom: 2px solid grey;
    }
    .category-button {
      margin: 5px;
    }

    ec-icon.small /deep/ .material-icons {
      font-size: 16px;
      height: 16px;
      width: 16px;
      padding-top: 1px;
      cursor: pointer;
    }

    .total {
      display: flex;
      justify-content: space-between;
    }

    .value {
      width: 100%;
      text-align: center;
      display: inline-block;
      font-family: Roboto,"Helvetica Neue",sans-serif;
      font-size: 12px;
    }

    .label {
      border-radius: 5px;
      border: 2px solid grey;
      background-color: darkgrey;
      font-size: 12px;
      color: white;
      padding-left: 5px;
      padding-right: 5px;
      padding-top: 3px;
    }

    th[mat-header-cell], td[mat-footer-cell], td[mat-cell] {
      padding-left: 5px;
      padding-right: 5px;
    }
  `
  ]
})
export class AllocationListComponent implements OnInit {
  Icon = Icon;
  @Input() editMode = false;
  @Input() budget: BudgetData;

  @ViewChild(MatTable) allocationList: MatTable<AllocationData>;

  displayedColumns: string[] = [
    "name",
    "amount",
    "spent",
    "remaining",
    "allocationClass",
    "isFixedAmount",
    "comment",
    "action"
  ];

  categoryColumns: string[] = [
    "categoryName",
    "categoryAmount",
    "categorySpent",
    "categoryRemaining",
    "categoryRest"
  ];

  allocationClasses = [
    { id: "want", name: "Want" },
    { id: "need", name: "Need" },
    { id: "savings", name: "Savings" }
  ];

  constructor(
    private budgetService: BudgetService,
    private transactionService: SharedTransactionService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {}

  showCategoryRow(index: number, allocation: AllocationData) {
    return allocation.firstInCategory;
  }

  showAllocationRow(index: number, allocation: AllocationData) {
    return !allocation.dummyTransaction;
  }

  showAddAllocationRow(index: number, allocation: AllocationData) {
    return allocation.lastInCategory;
  }

  trackAllocation(index: number, allocation: AllocationData) {
    if (!allocation) {
      return 11;
    }
    return allocation.id;
  }

  addAllocation(categoryId: number, position: number) {
    // push the new allocation as the last allocation in its category
    this.budget.allocations[position].lastInCategory = false;

    const newAllocation: AllocationData = {
      id: null,
      name: "",
      amount: 0,
      spent: 0,
      budget_id: this.budget.id,
      allocation_category_id: categoryId,
      lastInCategory: true
    };
    this.budget.allocations.splice(position + 1, 0, newAllocation);

    // we need to manually re-render the data table rows since we added a new data item
    this.allocationList.renderRows();
  }

  totalAmountFor(categoryId: number): number {
    return total(
      this.budget.allocations.filter(
        a => a.allocation_category_id === categoryId
      ),
      "amount"
    );
  }

  totalSpentFor(categoryId: number): number {
    return total(
      this.budget.allocations.filter(
        a => a.allocation_category_id === categoryId
      ),
      "spent"
    );
  }

  totalRemainingFor(categoryId: number): number {
    return this.totalAmountFor(categoryId) - this.totalSpentFor(categoryId);
  }

  showTransactionsFor(allocation: AllocationData) {
    let dialogRef: MatDialogRef<CompactTransactionListComponent>;
    this.transactionService
      .transactionsForAllocation(allocation.id)
      .subscribe(transactions => {
        dialogRef = this.dialog.open(CompactTransactionListComponent, {
          width: "500px"
        });
        dialogRef.componentInstance.transactions = transactions;
        dialogRef.componentInstance.itemName = allocation.name;
      });
  }

  totalAmount(): number {
    return total(this.budget.allocations, "amount");
  }

  totalSpent(): number {
    return total(this.budget.allocations, "spent");
  }
  totalRemaining(): number {
    return this.totalAmount() - this.totalSpent();
  }

  totalDiscretionaryAmount() {
    return (
      total(this.budget.incomes, "amount") -
      total(this.budget.allocations, "amount")
    );
  }
}
