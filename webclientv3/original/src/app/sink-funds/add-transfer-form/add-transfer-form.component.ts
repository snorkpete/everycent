import {Component, Input, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {SinkFundData} from '../sink-fund-data.model';
import {SinkFundCalculator} from '../sink-fund-calculator.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SinkFundService} from '../sink-fund.service';

@Component({
  selector: 'ec-add-transfer-form',
  styles: [`
    md-select, ec-money-field {
        margin-top: 36px;
    }
    
    div.actions {
        width: 100%;
    }
    
    ec-money-field md-input-container{
        width: 100%;
    }
  `],
  template: `
    <h1 md-dialog-title>Transfer Money</h1>
    <div md-dialog-content>
        <div fxLayout="column" fxLayoutAlign="space-between" [formGroup]="transfer">
              <md-select placeholder="Transfer From" formControlName="existing_allocation_id">
                  <md-option [value]="0">Unassigned Money - {{ calculator.unassignedBalance(sinkFund) | ecMoney}}</md-option>
                  <md-option *ngFor="let allocation of sinkFund.sink_fund_allocations" [value]="allocation.id">
                      {{ allocation.name }} ( {{ allocation.current_balance | ecMoney }} )
                  </md-option>
              </md-select>

              <md-select placeholder="Transfer To" formControlName="new_allocation_id">
                  <md-option [value]="0">Unassigned Money - {{ calculator.unassignedBalance(sinkFund) | ecMoney}}</md-option>
                  <md-option *ngFor="let allocation of sinkFund.sink_fund_allocations" [value]="allocation.id">
                      {{ allocation.name }} - {{ allocation.current_balance | ecMoney}}
                  </md-option>
              </md-select>
                
            <ec-money-field placeholder="Amount" formControlName="amount" fxFlex="1"
                            [editMode]="true">
            </ec-money-field>
        </div>
    </div>
    <div md-dialog-actions>
      <div class="actions" fxLayout="row" fxLayoutAlign="space-around">
          <button md-raised-button color="primary" (click)="save()">Save</button>
          <button md-raised-button color="warn" (click)="cancel()">Cancel</button>
      </div>
    </div>
  `
})
export class AddTransferFormComponent implements OnInit {

  @Input() sinkFund: SinkFundData;
  calculator = new SinkFundCalculator();
  transfer: FormGroup;

  constructor(
    public dialogRef: MdDialogRef<AddTransferFormComponent>,
    private fb: FormBuilder,
    private sinkFundService: SinkFundService
  ) { }

  ngOnInit() {
    this.transfer = this.fb.group({
      existing_allocation_id: 0,
      new_allocation_id: 0,
      amount: 0
    });
  }

  save() {
    this.sinkFundService
        .transfer(this.sinkFund, this.transfer.value)
        .subscribe( sinkFund => {
          this.sinkFundService.refreshSinkFund();
          this.dialogRef.close(sinkFund);
        },
          (error) => alert(error)
        );

  }

  cancel() {
    this.dialogRef.close(false);
  }
}
