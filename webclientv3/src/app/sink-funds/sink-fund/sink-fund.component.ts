import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {SinkFundData} from '../sink-fund-data.model';
import {ObservableMedia} from '@angular/flex-layout';
import {Subscription} from 'rxjs/Subscription';
import {total} from '../../util/total';
import {FormType} from '../../shared/form/form-field/form-field.component';
import {SinkFundCalculator} from '../sink-fund-calculator.service';

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
        font-size: 14px;
        border-top: 2px solid black;
    }
  `],
  template: `
    <md-card>
        <md-toolbar color="primary">Sink Fund Obligations</md-toolbar>
        <div class="fixed">
            <table *ngIf="sinkFund" class="table" [class.small-screen]="isSmallScreen">

              <thead>
              <tr>
                <th [style.width.%]="30">Goal / Obligation</th>
                <th [style.width.%]="10">Target</th>
                <th [style.width.%]="10">Current Balance</th>

                <th [style.width.%]="10">Outstanding</th>
                <th [style.width.%]="25">Comment</th>
                <th [style.width.%]="5">Status</th>
              </tr>
              </thead>

              <tbody>
              
                <tr class="highlight">
                    <td>Sink Fund Account Balance</td>
                    <td></td>
                    <td><ec-money-field [value]="sinkFund.current_balance"></ec-money-field></td>
 
                    <td></td>
                    <td>Current Account Balance</td>
                    <td></td>
                </tr>
                
                <tr class="highlight">
                    <td>Unassigned Money</td>
                    <td></td>
                    <td><ec-money-field [value]="calculator.unassignedBalance(sinkFund)"></ec-money-field></td>

                    <td></td>
                    <td>Money not assigned to any financial goal/obligation</td>
                    <td></td>
                </tr>
                
                <tr *ngFor="let allocation of sinkFund.sink_fund_allocations">
                    <td><ec-text-field [(ngModel)]="allocation.name" [editMode]="isEditMode"></ec-text-field></td>
                    <td><ec-money-field [(ngModel)]="allocation.amount" [editMode]="isEditMode"></ec-money-field></td>
                    <td><ec-money-field [value]="allocation.current_balance"></ec-money-field></td>

                    <td><ec-money-field [value]="allocation.current_balance-allocation.amount"></ec-money-field></td>
                    <td><ec-text-field [(ngModel)]="allocation.comment"></ec-text-field></td>
                    <td>
                        <!--<pre>{{allocation | json}}</pre>-->
                    </td>
                </tr>
              </tbody>

              <tfoot>
              <tr class="total">
                  <td>Total</td>
                  <td><ec-money-field [value]="calculator.totalTarget(sinkFund)"></ec-money-field></td>
                  <td><ec-money-field [value]="sinkFund.current_balance"></ec-money-field></td>
                  
                  <td><ec-money-field [value]="calculator.totalOutstanding(sinkFund)"></ec-money-field></td>
                  <td></td>
                  <td></td>
              </tr>

              </tfoot>
            </table>
        </div>
        <md-card-actions>
            <button md-raised-button (click)="isEditMode = !isEditMode">Toggle Edit</button>
        </md-card-actions>

    </md-card>
  `,
})
export class SinkFundComponent implements OnInit, OnDestroy {

  @Input() sinkFund: SinkFundData;

  calculator = new SinkFundCalculator();

  columns: { flex: number, allocationField: string, text: string, type: string, editable?: boolean}[];

  isSmallScreen: boolean;
  isEditMode = false;
  mediaSubscription: Subscription;

  constructor(
    private media: ObservableMedia
  ) { }

  ngOnInit() {
    this.sinkFund = { sink_fund_allocations: [] };

    this.mediaSubscription = this.media.subscribe( () => {
      this.isSmallScreen = this.media.isActive('xs');
    });
  }

  ngOnDestroy() {
    this.mediaSubscription.unsubscribe();
  }
}
