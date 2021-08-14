import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { TransactionImporterService } from "../transaction-importer.service";

@Component({
  selector: "ec-transaction-importer",
  styles: [],
  template: `
    <h1 mat-dialog-title>Import Transactions</h1>
    <mat-dialog-content>
      <div fxLayout="column" fxFlex>
        <textarea
          rows="5"
          cols="10"
          placeholder="Copy the transactions from your bank here"
          [(ngModel)]="input"
        >
        </textarea>
        <mat-form-field>
          <mat-select [(ngModel)]="importType" placeholder="Import Format">
            <mat-option *ngFor="let option of options" [value]="option.value">{{
              option.text
            }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button
        mat-raised-button
        color="primary"
        type="submit"
        (click)="importTransactions()"
      >
        Import
      </button>
      <button mat-raised-button mat-dialog-close>Cancel</button>
    </mat-dialog-actions>
  `
})
export class TransactionImporterComponent implements OnInit {
  options = [
    { text: "ABN Amro Bank Account", value: "abn-amro-bank" },
    { text: "ABN Amro Bank Account (old format)", value: "abn-amro-bank-old" },
    { text: "ABN Amro Credit Card", value: "abn-amro-creditcard" },
    { text: "Scotia Bank Account", value: "new-bank-account" },
    { text: "FCB Bank Account", value: "fc-bank" },
    { text: "FCB Credit Card (not implemented)", value: "fc-creditcard" },
    { text: "Republic Bank Account", value: "republic-bank" },
    {
      text: "Republic Credit Card (not implemented)",
      value: "republic-creditcard"
    }
  ];

  input: string;
  @Input() startDate: string;
  @Input() endDate: string;
  @Input() importType = "abn-amro-bank";

  // provided for easier testing of this component
  @Output() import = new EventEmitter();

  constructor(
    private importerService: TransactionImporterService,
    private dialogRef: MatDialogRef<TransactionImporterComponent>
  ) {}

  ngOnInit() {}

  importTransactions() {
    let transactions = this.importerService.convertToTransactions(
      this.input,
      this.startDate,
      this.endDate,
      this.importType
    );
    this.import.emit(transactions);
    this.dialogRef.close(transactions);
  }
}
