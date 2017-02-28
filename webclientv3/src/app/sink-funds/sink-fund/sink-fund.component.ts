import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SinkFundData} from '../sink-fund-data.model';
import {ObservableMedia} from '@angular/flex-layout';
import {Subscription} from 'rxjs';

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
                    <tr *ngFor="let allocation of sinkFund.sink_fund_allocations">
                        <td *ngFor="let column of columns">
                            {{ allocation[column.allocationField] }}
                        </td>
                    </tr>
                  </tbody>
                  
                  <tfoot></tfoot>
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
    this.createColumns();

    this.mediaSubscription = this.media.subscribe( () => {
      this.isSmall = this.media.isActive('xs');
    });
  }

  ngOnDestroy() {
    this.mediaSubscription.unsubscribe();
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
  }


}
