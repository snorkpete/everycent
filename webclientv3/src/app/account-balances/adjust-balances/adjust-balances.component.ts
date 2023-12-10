import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import {
  BankAccountAdjustmentData,
  BankAccountAdjustmentsParams
} from "../bank-account-adjustment.model";
import { BankAccountData } from "../bank-account.model";

@Component({
  selector: "ec-adjust-balances",
  template: `
    <h1 mat-dialog-title>Adjust Account Balances</h1>
    <div mat-dialog-content>
      <div [formGroup]="form">
        <table class="table">
          <thead>
            <tr>
              <th>Bank Account</th>
              <th *ngFor="let bankAccount of bankAccounts">
                {{ bankAccount.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Current Balance
              </td>
              <td
                formArrayName="adjustments"
                *ngFor="let bankAccount of bankAccounts; let i = index"
              >
                <div [formGroupName]="i">
                  <ec-money-field
                    [editMode]="false"
                    formControlName="currentBalance"
                  ></ec-money-field>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                New Account Balance
              </td>
              <td
                formArrayName="adjustments"
                *ngFor="let bankAccount of bankAccounts; let i = index"
              >
                <div [formGroupName]="i">
                  <ec-money-field
                    [editMode]="true"
                    formControlName="new_balance"
                  ></ec-money-field>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div mat-dialog-actions>
      <ec-edit-actions
        [editMode]="true"
        (save)="saveChanges()"
        (cancel)="cancelChanges()"
      >
      </ec-edit-actions>
    </div>
  `,
  styles: []
})
export class AdjustBalancesComponent implements OnInit {
  @Input() bankAccounts: BankAccountData[] = [];
  @Output() save = new EventEmitter<BankAccountAdjustmentsParams>();
  @Output() cancel = new EventEmitter();

  form: UntypedFormGroup;
  constructor(
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<AdjustBalancesComponent>
  ) {}

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    let amountsWithIds = this.bankAccounts.map(bankAccount => {
      return this.fb.group({
        bank_account_id: bankAccount.id,
        new_balance: bankAccount.current_balance,
        currentBalance: bankAccount.current_balance
      });
    });

    this.form = this.fb.group({
      adjustments: this.fb.array(amountsWithIds)
    });
  }

  saveChanges() {
    this.save.emit(this.form.value);
    this.save.complete();
  }

  cancelChanges() {
    this.cancel.emit();
    this.cancel.complete();
    this.dialogRef.close();
  }
}
