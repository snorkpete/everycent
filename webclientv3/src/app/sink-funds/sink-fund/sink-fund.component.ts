import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SinkFundData} from '../sink-fund-data.model';
import {ObservableMedia} from '@angular/flex-layout';
import {Subscription} from 'rxjs/Subscription';
import {total} from '../../util/total';

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
    
    table.table.small {
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
              <table *ngIf="sinkFund" class="table" [class.small]="isSmall">

                  <thead>
                    <th *ngFor="let column of columns" [style.width.%]="column.flex">{{column.text}}</th>
                  </thead>

                  <tbody>
                    <tr class="highlight">
                        <td *ngFor="let column of getAccountBalanceColumns()">
                            {{ column }}
                        </td>
                    </tr>
                    <tr class="highlight">
                        <td *ngFor="let column of getUnassignedMoneyColumns()">
                            {{ column }}
                        </td>
                    </tr>
                    <tr *ngFor="let allocation of sinkFund.sink_fund_allocations">
                        <td *ngFor="let column of columns">
                            {{ allocation[column.allocationField] }}
                        </td>
                    </tr>
                  </tbody>
                  
                  <tfoot>
                    <tr class="total">
                        <td *ngFor="let column of getTotalColumns()">
                            {{ column }}
                        </td>
                    </tr>

                  </tfoot>
              </table>
          </div>

      </md-card>
  `,
})
export class SinkFundComponent implements OnInit, OnDestroy {

  @Input() sinkFund: SinkFundData;

  columns: { flex: number, allocationField: string, text: string}[];

  isSmall: boolean;
  mediaSubscription: Subscription;

  constructor(
    private media: ObservableMedia
  ) { }

  ngOnInit() {
    this.sinkFund = { sink_fund_allocations: [] };
    this.createColumns();

    this.mediaSubscription = this.media.subscribe( () => {
      this.isSmall = this.media.isActive('xs');
    });
  }

  ngOnDestroy() {
    this.mediaSubscription.unsubscribe();
  }

  getAccountBalanceColumns() {
    return [
      'Sink Fund Account Balance',
      '',
      this.sinkFund.current_balance,
      '',
      'Current Account Balance',
      '',
      ''
    ];
  }

  getUnassignedMoneyColumns() {
    return [
      'Unassigned Money',
      '',
      total(this.sinkFund ? this.sinkFund.sink_fund_allocations : [], 'amount'),
      '',
      'Money not assigned to any financial goal/obligation',
      '',
      '',
    ];
  }

  getTotalColumns() {
    return [
      'Total',
      total(this.sinkFund.sink_fund_allocations, 'target'),
      total(this.sinkFund.sink_fund_allocations, 'current_balance'),

      this.getAccountBalance(),
      '',
      '',
      '',
    ];
  }

  getUnassignedBalance(){
    return this.sinkFund.current_balance - total(this.sinkFund.sink_fund_allocations, 'current_balance');
  }


  getAccountBalance() {
    return total(this.sinkFund.sink_fund_allocations, 'remaining') +
        this.getUnassignedBalance();
  }


  private createColumns() {
    this.columns = [
      { text: 'Goal / Obligation', allocationField: 'name',   flex: 30 },
      { text: 'Target',            allocationField: 'amount', flex: 10 },
      { text: 'Current Balance', allocationField: 'current_balance', flex: 10 },

      { text: 'Outstanding', allocationField: 'difference', flex: 10 },
      { text: 'Comment', allocationField: 'comment', flex: 25 },
      { text: 'Status', allocationField: 'comment', flex: 10 },
      { text: '', allocationField: 'none', flex: 5 },
    ];

  };

}
