import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { groupBy } from "lodash-es";
import { BankAccountData } from "../../bank-accounts/bank-account.model";
import { BankAccountService } from "../../bank-accounts/bank-account.service";
import { AllocationCategoryData } from "../../budgets/allocation.model";
import { BudgetData } from "../../budgets/budget.model";
import { MessageService } from "../../message-display/message.service";
import { MoneyFieldComponent } from "../../shared/form/money-field/money-field.component";
import { SinkFundAllocationData } from "../../sink-funds/sink-fund-allocation-data.model";
import { AllocationData } from "../allocation-data.model";
import { AccountTransferData } from "./account-transfer-data.model";
import { AccountTransferService } from "./account-transfer.service";

@Component({
  selector: "ec-transfer-form",
  template: `
    <h1 mat-dialog-title>Bank Account Transfer</h1>
    <mat-dialog-content>
      <mat-form-field>
        <mat-select
          placeholder="From"
          data-cy-from-field
          [(ngModel)]="accountTransfer.from"
          (selectionChange)="selectFromBankAccount()"
        >
          <mat-option
            *ngFor="let bankAccount of bankAccounts"
            [value]="bankAccount.id"
            >{{ bankAccount.name }}
            <em>({{ bankAccount.current_balance | ecMoney }})</em>
          </mat-option>
        </mat-select>
        <mat-hint align="end"
          >New Balance: {{ newFromBalance() | ecMoney }}</mat-hint
        >
      </mat-form-field>

      <mat-form-field>
        <ng-container
          *ngIf="
            fromAccount.is_sink_fund;
            then sinkFundAllocationFrom;
            else allocationFrom
          "
        ></ng-container>

        <ng-template #sinkFundAllocationFrom>
          <mat-select
            placeholder="From Sink Fund Allocation"
            [(ngModel)]="accountTransfer.from_sink_fund_allocation"
          >
            <mat-option [value]="0"></mat-option>

            <mat-option
              *ngFor="let sinkFundAllocation of sinkFundAllocationsFrom"
              [value]="sinkFundAllocation.id"
              >{{ sinkFundAllocation.name }}
            </mat-option>
          </mat-select>
        </ng-template>

        <ng-template #allocationFrom>
          <mat-select
            placeholder="From Allocation"
            [(ngModel)]="accountTransfer.from_allocation"
          >
            <mat-option [value]="0"></mat-option>

            <mat-optgroup
              [label]="category.name"
              *ngFor="let category of allocationCategories; trackBy: trackById"
            >
              <mat-option
                *ngFor="let allocation of category.allocations"
                [value]="allocation.id"
                >{{ allocation.name }}
              </mat-option>
            </mat-optgroup>
          </mat-select>
        </ng-template>
      </mat-form-field>

      <mat-form-field>
        <mat-select
          placeholder="To"
          data-cy-to-field
          [(ngModel)]="accountTransfer.to"
          (selectionChange)="selectToBankAccount()"
        >
          <mat-option
            *ngFor="let bankAccount of bankAccounts"
            [value]="bankAccount.id"
            >{{ bankAccount.name }}
            <em>({{ bankAccount.current_balance | ecMoney }})</em>
          </mat-option>
        </mat-select>
        <mat-hint align="end"
          >New Balance: {{ newToBalance() | ecMoney }}</mat-hint
        >
      </mat-form-field>

      <mat-form-field>
        <ng-container
          *ngIf="
            toAccount.is_sink_fund;
            then sinkFundAllocationTo;
            else allocationTo
          "
        ></ng-container>

        <ng-template #sinkFundAllocationTo>
          <mat-select
            placeholder="To Sink Fund Allocation"
            [(ngModel)]="accountTransfer.to_sink_fund_allocation"
          >
            <mat-option [value]="0"></mat-option>
            <mat-option
              *ngFor="let sinkFundAllocation of sinkFundAllocationsTo"
              [value]="sinkFundAllocation.id"
              >{{ sinkFundAllocation.name }}
            </mat-option>
          </mat-select>
        </ng-template>

        <ng-template #allocationTo>
          <mat-select
            placeholder="To Allocation"
            [(ngModel)]="accountTransfer.to_allocation"
          >
            <mat-option [value]="0"></mat-option>

            <mat-optgroup
              [label]="category.name"
              *ngFor="let category of allocationCategories; trackBy: trackById"
            >
              <mat-option
                *ngFor="let allocation of category.allocations"
                [value]="allocation.id"
                >{{ allocation.name }}
              </mat-option>
            </mat-optgroup>
          </mat-select>
        </ng-template>
      </mat-form-field>

      <ec-date-field
        [editMode]="true"
        [(ngModel)]="accountTransfer.date"
        [ecValidateWithinBudget]="budget"
        [errorMessage]="'test'"
      >
      </ec-date-field>

      <ec-text-field
        data-cy-description-field
        placeholder="Description"
        [editMode]="true"
        [(ngModel)]="accountTransfer.description"
      ></ec-text-field>

      <ec-money-field
        data-cy-amount-field
        placeholder="Amount"
        [editMode]="true"
        [(ngModel)]="accountTransfer.amount"
      ></ec-money-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <div class="actions" fxLayout="row" fxLayoutAlign="space-around">
        <button mat-raised-button color="primary" (click)="save()">Save</button>
        <button mat-raised-button color="warn" (click)="cancel()">
          Cancel
        </button>
      </div>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `
  ]
})
export class AccountTransferFormComponent implements OnInit {
  @ViewChild("amount", { static: true, read: MoneyFieldComponent })
  amountField: MoneyFieldComponent;

  constructor(
    private bankAccountService: BankAccountService,
    private transferService: AccountTransferService,
    private messageService: MessageService,
    public dialogRef: MatDialogRef<AccountTransferFormComponent>
  ) {}

  fromAccount: BankAccountData = {};
  toAccount: BankAccountData = {};
  bankAccounts: BankAccountData[] = [];
  budget: BudgetData = {};
  allocations: AllocationData[] = [];
  allocationCategories: AllocationCategoryData[] = [];
  sinkFundAllocationsFrom: SinkFundAllocationData[] = [];
  sinkFundAllocationsTo: SinkFundAllocationData[] = [];
  accountTransfer: AccountTransferData = {
    from: 0,
    to: 0,
    amount: 0,
    description: "",
    date: new Date().toISOString().substr(0, 10)
  };

  ngOnInit() {
    setTimeout(() => {
      this.bankAccountService
        .getBankAccountsWithBalances()
        .subscribe(bankAccounts => (this.bankAccounts = bankAccounts));
    }, 0);
  }

  findAccountById(id: number) {
    return (
      this.bankAccounts.find(account => account.id === id) || {
        current_balance: 0
      }
    );
  }

  setBudget(budget: BudgetData) {
    this.budget = budget;
    this.allocations = budget.allocations;

    let itemsByGroupId = groupBy(this.allocations, "allocation_category_id");
    this.allocationCategories = Object.keys(itemsByGroupId)
      .map(groupId => {
        let items = itemsByGroupId[groupId];
        let category: AllocationCategoryData = { id: Number(groupId) };
        category.name = items[0]["allocation_category"].name;
        category.allocations = items;
        return category;
      })
      .sort((a, b) => String(a.name).localeCompare(b.name));
    this.accountTransfer.budget_id = this.budget.id;
  }

  selectFromBankAccount() {
    const bankAccount =
      this.bankAccounts.find(
        account => account.id === this.accountTransfer.from
      ) || {};
    this.fromAccount = bankAccount;

    if (bankAccount.is_sink_fund) {
      this.bankAccountService
        .getSinkFundAllocations(bankAccount.id)
        .subscribe(
          sinkFundAllocations =>
            (this.sinkFundAllocationsFrom = sinkFundAllocations)
        );
    } else {
      this.sinkFundAllocationsFrom = [];
    }
  }

  selectToBankAccount() {
    const bankAccount =
      this.bankAccounts.find(
        account => account.id === this.accountTransfer.to
      ) || {};
    this.toAccount = bankAccount;

    if (bankAccount.is_sink_fund) {
      this.bankAccountService
        .getSinkFundAllocations(bankAccount.id)
        .subscribe(
          sinkFundAllocations =>
            (this.sinkFundAllocationsTo = sinkFundAllocations)
        );
    } else {
      this.sinkFundAllocationsTo = [];
    }
  }

  newFromBalance() {
    return (
      this.findAccountById(this.accountTransfer.from).current_balance -
      this.accountTransfer.amount
    );
  }

  newToBalance() {
    return (
      this.findAccountById(this.accountTransfer.to).current_balance +
      this.accountTransfer.amount
    );
  }

  save() {
    this.transferService.transfer(this.accountTransfer).subscribe(
      response => {
        this.messageService.setMessage("Transfer completed.");
        this.dialogRef.close();
      },
      response => {
        this.messageService.setErrorMessage(
          "Error: " + (response.error && response.error.reason) || "save failed"
        );
      }
    );
  }

  cancel() {
    this.dialogRef.close();
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}
