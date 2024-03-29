import {Component, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import {SharedTransactionService} from "../../../shared-transactions/shared-transaction.service";
import {Icon} from "../../../shared/ec-icon/icon.type";
import {CompactTransactionListComponent} from "../../../shared-transactions/compact-transaction-list/compact-transaction-list.component";
import {AllocationData} from "../../allocation.model";

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
    ec-icon.small ::ng-deep .material-icons {
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
    private transactionService: SharedTransactionService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  showTransactionsFor(allocation: AllocationData) {
    let dialogRef: MatDialogRef<CompactTransactionListComponent>;
    this.transactionService
      .transactionsForAllocation(allocation.id)
      .subscribe(transactions => {
        dialogRef = this.dialog.open(CompactTransactionListComponent, { width: '500px' });
        dialogRef.componentInstance.transactions = transactions;
        dialogRef.componentInstance.itemName = allocation.name;
      });
  }
}
