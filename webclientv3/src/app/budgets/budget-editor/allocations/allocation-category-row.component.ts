import {Component, Input, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material";
import {Icon} from "../../../shared/ec-icon/icon.type";
import {CompactTransactionListComponent} from "../../../transactions/compact-transaction-list/compact-transaction-list.component";
import {TransactionService} from "../../../transactions/transaction.service";
import {AllocationData} from "../../allocation.model";
import {BudgetService} from "../../budget.service";

@Component({ /* tslint:disable component-selector */
  selector: '[ec-allocation-category-row]',
  template: `
    <td>
      <ec-text-field [(ngModel)]="allocation.name" [editMode]="editMode"></ec-text-field>
    </td>
    <td class="right">
      <ec-money-field [(ngModel)]="allocation.amount" [editMode]="editMode"></ec-money-field>
    </td>
    <td class="right">
      <div fxLayout="row" fxLayoutAlign="start center">
        <ec-icon [icon]="Icon.SHOW_TRANSACTIONS"
                 (click)="showTransactionsFor(allocation)"
                 class="small">
        </ec-icon>
        <span fxFlex></span>
        <ec-money-field [value]="allocation.spent"></ec-money-field>
      </div>
    </td>
    <td class="right">
      <ec-money-field [value]="allocation.amount - allocation.spent" [highlightPositive]="true"></ec-money-field>
    </td>
    <td>
      <ec-text-field [(ngModel)]="allocation.comment" [editMode]="editMode"></ec-text-field>
    </td>
    <td>
      <ec-delete-button [item]="allocation" [editMode]="editMode"></ec-delete-button>
    </td>
  `,
  styles: [`
    ec-icon.small /deep/ .material-icons {
      font-size: 16px;
      height: 16px;
      width: 16px;
      padding-top: 1px;
      cursor: pointer;
    }
  `]
})
export class AllocationCategoryRowComponent implements OnInit {

  Icon = Icon;
  @Input() allocation: AllocationData = {};
  @Input() editMode = false;

  constructor(
    private budgetService: BudgetService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  showTransactionsFor(allocation: AllocationData) {
    let dialogRef: MatDialogRef<CompactTransactionListComponent>;
    this.budgetService
      .transactionsForAllocation(allocation)
      .subscribe(transactions => {
        dialogRef = this.dialog.open(CompactTransactionListComponent, { width: '500px' });
        dialogRef.componentInstance.transactions = transactions;
        dialogRef.componentInstance.itemName = allocation.name;
      });
  }
}
