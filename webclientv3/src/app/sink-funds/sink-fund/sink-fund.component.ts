import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SinkFundData} from '../sink-fund-data.model';
import {ObservableMedia} from '@angular/flex-layout';
import {Subscription} from 'rxjs/Subscription';
import {SinkFundCalculator} from '../sink-fund-calculator.service';
import {SinkFundService} from '../sink-fund.service';
import {MdDialog, MdSnackBar} from '@angular/material';
import {AddTransferFormComponent} from '../add-transfer-form/add-transfer-form.component';

@Component({
  selector: 'ec-sink-fund',
  styles: [`
    div.fixed {
        width: 100%;
        overflow-x: auto;
    }
    
    table.table {
        table-layout: fixed;
        width: 100%; 
    }
    
    table.table.small-screen {
        width: 768px;
    }
    
    .highlight {
        font-weight: bold;
        font-size: 13px;
    }
    
    .total {
        font-weight: bold;
        font-size: 16px;
        border-top: 2px solid black;
        border-bottom: 2px solid black;
    }
  `],
  template: `
    <md-card>
        <md-toolbar color="primary">Sink Fund Obligations</md-toolbar>
        <md-card-content>
        <div class="fixed">
            <table *ngIf="sinkFund" class="table" [class.small-screen]="isSmallScreen">

              <thead>
              <tr>
                <th [style.width.%]="30">Goal / Obligation</th>
                <th [style.width.%]="10">Current Balance</th>
                <th [style.width.%]="10">Target</th>

                <th [style.width.%]="10">Outstanding</th>
                <th [style.width.%]="25">Comment</th>
                <th [style.width.%]="5">Status</th>
              </tr>
              </thead>

              <tbody>
              
                <tr class="total">
                    <td>Sink Fund Account Balance</td>
                    <td><ec-money-field [value]="sinkFund.current_balance"></ec-money-field></td>
                    <td></td>
 
                    <td></td>
                    <td>Current Account Balance</td>
                    <td></td>
                </tr>
                
                <tr class="total">
                    <td>Unassigned Money</td>
                    <td><ec-money-field [value]="calculator.unassignedBalance(sinkFund)"></ec-money-field></td>
                    <td></td>

                    <td></td>
                    <td>Money not assigned to any financial goal/obligation</td>
                    <td></td>
                </tr>
                
                <tr *ngFor="let allocation of sinkFund.sink_fund_allocations">
                    <td><ec-text-field [(ngModel)]="allocation.name" [editMode]="isEditMode"></ec-text-field></td>
                    <td class="highlight"><ec-money-field [value]="allocation.current_balance"></ec-money-field></td>
                    <td><ec-money-field [(ngModel)]="allocation.target" [editMode]="isEditMode"></ec-money-field></td>

                    <td>
                        <ec-money-field [value]="allocation.current_balance-allocation.target" highlightPositive="true"></ec-money-field>
                    </td>
                    <td><ec-text-field [(ngModel)]="allocation.comment"></ec-text-field></td>
                    <td>
                        <ec-delete-button [item]="allocation" [editMode]="isEditMode"></ec-delete-button>
                    </td>
                </tr>
              </tbody>

              <tfoot>
              <tr class="total">
                  <td>Total</td>
                  <td><ec-money-field [value]="calculator.totalAssignedBalance(sinkFund)"></ec-money-field></td>
                  <td><ec-money-field [value]="calculator.totalTarget(sinkFund)"></ec-money-field></td>
                  
                  <td><ec-money-field [value]="calculator.totalOutstanding(sinkFund)"></ec-money-field></td>
                  <td></td>
                  <td></td>
              </tr>

              </tfoot>
            </table>
        </div>
        </md-card-content>
        <md-card-actions>
            <ec-edit-actions [(editMode)]="isEditMode" (save)="save()" (cancel)="cancel()" >

                <button md-raised-button color="primary" *ngIf="!isEditMode"
                        (click)="showTransferForm()">
                    Transfer Money
                </button>
                
            </ec-edit-actions>
        </md-card-actions>

    </md-card>
  `,
})
export class SinkFundComponent implements OnInit, OnDestroy {

  @Input() sinkFund: SinkFundData;

  calculator = new SinkFundCalculator();

  isSmallScreen: boolean;
  isEditMode = false;
  mediaSubscription: Subscription;

  constructor(
    private media: ObservableMedia,
    private sinkFundService: SinkFundService,
    private dialog: MdDialog,
    private snackbar: MdSnackBar
  ) { }

  ngOnInit() {
    this.sinkFund = { sink_fund_allocations: [] };

    this.mediaSubscription = this.media.subscribe( () => {
      this.isSmallScreen = this.media.isActive('xs');
    });
  }

  save() {
    this.sinkFundService
        .save(this.sinkFund)
        .subscribe( result => {
          this.sinkFund = result;
          this.isEditMode = false;
        },
          error => alert(JSON.stringify(error))
        );
  }

  cancel() {
    console.log('cancel');
  }

  showTransferForm() {
    let dialogRef = this.dialog.open(AddTransferFormComponent, {
      width: '300px'
    });
    dialogRef.componentInstance.sinkFund = this.sinkFund;
    dialogRef.afterClosed().subscribe(isSaved => {
      if (isSaved) {
        this.snackbar.open('Transfer complete.', null, {duration: 3000});
      }else {
        this.snackbar.open('Transfer cancelled.', null, {duration: 1500});
      }
    });
  }

  ngOnDestroy() {
    this.mediaSubscription.unsubscribe();
  }
}
