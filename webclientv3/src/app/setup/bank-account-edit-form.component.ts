import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { BankAccountData } from "../bank-accounts/bank-account.model";
import { InstitutionData } from "../bank-accounts/institution.model";

@Component({
  selector: "ec-bank-account-edit-form",
  template: `
    <h1 mat-dialog-title>Bank Account Details</h1>
    <div mat-dialog-content>
      <div [formGroup]="form">
        <ec-text-field
          class="form"
          [(editMode)]="editMode"
          formControlName="name"
          placeholder="Name"
        ></ec-text-field>
        <ec-list-field
          class="form"
          [(editMode)]="editMode"
          formControlName="account_type"
          [items]="accountFeatureTypes"
          placeholder="Account Features"
        >
        </ec-list-field>
        <ec-text-field
          class="form"
          [(editMode)]="editMode"
          formControlName="account_type_description"
          placeholder="Account Type Description"
        >
        </ec-text-field>
        <ec-list-field
          class="form"
          [(editMode)]="editMode"
          formControlName="account_category"
          [items]="accountCategories"
          placeholder="Account Category"
        >
        </ec-list-field>
        <ec-list-field
          class="form"
          [(editMode)]="editMode"
          formControlName="is_cash"
          [items]="yesNoList"
          placeholder="Is Cash Account?"
        >
        </ec-list-field>
        <ec-list-field
          class="form"
          [(editMode)]="editMode"
          formControlName="institution_id"
          [items]="institutions"
          placeholder="Financial Institution"
        >
        </ec-list-field>
        <ec-text-field
          class="form"
          [(editMode)]="editMode"
          formControlName="account_no"
          placeholder="Official Account #"
        >
        </ec-text-field>
        <ec-money-field
          class="form"
          [(editMode)]="editMode"
          formControlName="opening_balance"
          placeholder="Opening Balance"
        >
        </ec-money-field>
        <ec-list-field
          class="form"
          [(editMode)]="editMode"
          formControlName="import_format"
          [items]="importFormats"
          placeholder="Bank Account Import Format"
        >
        </ec-list-field>
        <ec-list-field
          class="form"
          [(editMode)]="editMode"
          formControlName="status"
          [items]="statuses"
          placeholder="Status"
        >
        </ec-list-field>

        <ng-container *ngIf="isCreditCard()">
          <h3>Credit Card Related</h3>
          <ec-text-field
            class="form"
            [(editMode)]="editMode"
            formControlName="statement_day"
            placeholder="Statement Day"
            type="number"
          ></ec-text-field>
          <ec-text-field
            class="form"
            [(editMode)]="editMode"
            formControlName="payment_due_day"
            placeholder="Payment Due Day"
            type="number"
          ></ec-text-field>
        </ng-container>
      </div>
    </div>
    <div mat-dialog-actions>
      <ec-edit-actions [(editMode)]="editMode" (save)="saveChanges()">
        <button
          *ngIf="!editMode"
          mat-raised-button
          color="warn"
          (click)="cancelChanges()"
        >
          Close
        </button>
      </ec-edit-actions>
    </div>
  `,
  styles: []
})
export class BankAccountEditFormComponent implements OnInit {
  @Input() bankAccount: BankAccountData = {};
  @Output() save = new EventEmitter<BankAccountData>();
  @Output() cancel = new EventEmitter();
  editMode = false;

  form: UntypedFormGroup;
  accountFeatureTypes = [
    { id: "normal", name: "Normal Features" },
    { id: "sink_fund", name: "Sink Fund Features" },
    { id: "credit_card", name: "Credit Card Features" }
  ];

  accountCategories = [
    { id: "asset", name: "Asset" },
    { id: "liability", name: "Liability" },
    { id: "current", name: "Current" }
  ];

  importFormats = [
    { name: "ABN Amro Bank Account", id: "abn-amro-bank" },
    { name: "ABN Amro Bank Account (old format)", id: "abn-amro-bank-old" },
    { name: "ABN Amro Credit Card", id: "abn-amro-creditcard" },
    { name: "Scotia Bank Account", id: "new-bank-account" },
    { name: "FCB Bank Account", id: "fc-bank" },
    { name: "FCB Credit Card (not implemented)", id: "fc-creditcard" },
    { text: "Republic Bank Account", value: "republic-bank" },
    {
      text: "Republic Credit Card (not implemented)",
      value: "republic-creditcard"
    }
  ];

  @Input() institutions: InstitutionData[] = [];

  yesNoList = [{ id: true, name: "Yes" }, { id: false, name: "No" }];

  statuses = [{ id: "open", name: "Open" }, { id: "closed", name: "Closed" }];

  constructor(
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<BankAccountEditFormComponent>
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      id: this.bankAccount.id,
      name: this.bankAccount.name,
      account_type: this.bankAccount.account_type,
      account_type_description: this.bankAccount.account_type_description,
      account_category: this.bankAccount.account_category,
      is_cash: this.bankAccount.is_cash,
      institution_id: this.bankAccount.institution_id,
      account_no: this.bankAccount.account_no,
      opening_balance: this.bankAccount.opening_balance,
      import_format: this.bankAccount.import_format,
      status: this.bankAccount.status,
      statement_day: this.bankAccount.statement_day,
      payment_due_day: this.bankAccount.payment_due_day
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

  isCreditCard() {
    return this.form.value && this.form.value.account_type === "credit_card";
  }
}
