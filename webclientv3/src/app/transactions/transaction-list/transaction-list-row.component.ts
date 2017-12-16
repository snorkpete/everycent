import {Component, Input, OnInit} from '@angular/core';
import {BankAccountData} from "../../bank-accounts/bank-account.model";
import {SinkFundAllocationData} from "../../sink-funds/sink-fund-allocation-data.model";
import {AllocationData} from "../allocation-data.model";
import {TransactionData} from "../transaction-data.model";

@Component({ /* tslint:disable component-selector */
  selector: '[ec-transaction-list-row]',
  styles: [`
    td .mat-form-field-inline {
      width: auto;
    }
  `],
  template: `
      <td>
        <mat-checkbox [(ngModel)]="transaction.selected"></mat-checkbox>
      </td>
      <td>
        <ec-date-field [editMode]="editMode" [(ngModel)]="transaction.transaction_date"></ec-date-field>
      </td>
      <!--
        <input ng-show="vm.isEditMode"
               name="vm.transaction_date[{{$index}}]"
               type="date"
               ng-model="vm.transaction.transaction_date"
               ng-change="vm.checkTransactionDate(vm.transaction, vm.search.budget)"
               ng-required="!vm.transaction.deleted"
               ec-as-date>
        </input>
        <span style="positive:relative; top:20px;" ng-show="vm.transaction.transaction_date_invalid" class=".help-block">
            Transaction date outside the budget period
        </span>
        <span ng-hide="vm.isEditMode"
              ng-bind="vm.transaction.transaction_date | date:'EEE dd MMM, yy'"></span>
      </td>
      -->

      <td>
        <ec-text-field [editMode]="editMode" [(ngModel)]="transaction.description"></ec-text-field>
      </td>

      <td>
        <mat-form-field fxFlex *ngIf="bankAccount?.is_sink_fund; else allocationField">
          <mat-select [(ngModel)]="transaction.sink_fund_allocation_id">
            <mat-option [value]=""></mat-option>
            <mat-option *ngFor="let allocation of sinkFundAllocations" [value]="allocation.id">{{allocation.name}}</mat-option>
          </mat-select>
        </mat-form-field>

        <ng-template #allocationField>
          <mat-form-field fxFlex>
            <mat-select [(ngModel)]="transaction.allocation_id">
              <mat-option [value]=""></mat-option>
              <mat-option *ngFor="let allocation of allocations" [value]="allocation.id">{{allocation.name}}</mat-option>
            </mat-select>
          </mat-form-field>
         </ng-template>
      </td>

      <td class="right">
        <ec-money-field [editMode]="editMode" [(ngModel)]="transaction.withdrawal_amount"></ec-money-field>
      </td>

      <td class="right">
        <ec-money-field [editMode]="editMode" [(ngModel)]="transaction.deposit_amount"></ec-money-field>
      </td>

      <td class="center">
        <ec-paid-field [editMode]="editMode" [(ngModel)]="transaction.status"></ec-paid-field>
      </td>

      <td>
        <ec-delete-button [editMode]="editMode" [item]="transaction"></ec-delete-button>
      </td>
  `,
})
export class TransactionListRowComponent implements OnInit {

  @Input() transaction: TransactionData;
  @Input() bankAccount: BankAccountData;
  @Input() allocations: AllocationData[] = [];
  @Input() sinkFundAllocations: SinkFundAllocationData[] = [];
  @Input() editMode: boolean;

  constructor() { }

  ngOnInit() {
  }

}
