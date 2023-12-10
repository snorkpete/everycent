import { Component, Input, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { DeactivateService } from "../../shared/deactivate-button/deactivate.service";
import { SinkFundData } from "../sink-fund-data.model";
import { SinkFundCalculator } from "../sink-fund-calculator.service";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { SinkFundService } from "../sink-fund.service";

@Component({
  selector: "ec-add-transfer-form",
  styles: [
    `
      mat-form-field,
      ec-money-field {
        margin-top: 24px;
      }

      div.actions {
        width: 100%;
      }

      ec-money-field mat-form-field {
        width: 100%;
      }
    `
  ],
  template: `
    <h1 mat-dialog-title>Transfer Money</h1>
    <div mat-dialog-content>
      <div
        fxLayout="column"
        fxLayoutAlign="space-between"
        [formGroup]="transfer"
      >
        <mat-form-field>
          <mat-select
            placeholder="Transfer From"
            formControlName="existing_allocation_id"
          >
            <mat-option [value]="0">
              Unassigned Money -
              {{ calculator.unassignedBalance(sinkFund) | ecMoney }}
            </mat-option>
            <mat-option
              *ngFor="let allocation of sinkFund.sink_fund_allocations"
              [value]="allocation.id"
            >
              {{ allocation.name }} (
              {{ allocation.current_balance | ecMoney }} )
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-select
            placeholder="Transfer To"
            formControlName="new_allocation_id"
          >
            <mat-option [value]="0">
              Unassigned Money -
              {{ calculator.unassignedBalance(sinkFund) | ecMoney }}
            </mat-option>
            <mat-option
              *ngFor="let allocation of sinkFund.sink_fund_allocations"
              [value]="allocation.id"
            >
              {{ allocation.name }} - {{ allocation.current_balance | ecMoney }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <ec-money-field
          placeholder="Amount"
          formControlName="amount"
          fxFlex="1"
          [editMode]="true"
        >
        </ec-money-field>
      </div>
    </div>
    <div mat-dialog-actions>
      <div class="actions" fxLayout="row" fxLayoutAlign="space-around">
        <button mat-raised-button color="primary" (click)="save()">Save</button>
        <button mat-raised-button color="warn" (click)="cancel()">
          Cancel
        </button>
      </div>
    </div>
  `
})
export class AddTransferFormComponent implements OnInit {
  @Input() sinkFund: SinkFundData;
  calculator: SinkFundCalculator;
  transfer: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddTransferFormComponent>,
    private fb: UntypedFormBuilder,
    private sinkFundService: SinkFundService,
    private deactivateService: DeactivateService
  ) {}

  ngOnInit() {
    this.calculator = new SinkFundCalculator(this.deactivateService);
    this.transfer = this.fb.group({
      existing_allocation_id: 0,
      new_allocation_id: 0,
      amount: 0
    });
  }

  save() {
    this.sinkFundService.transfer(this.sinkFund, this.transfer.value).subscribe(
      sinkFund => {
        this.sinkFundService.refreshSinkFund(this.sinkFund.id);
        this.dialogRef.close(sinkFund);
      },
      error => alert(error)
    );
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
