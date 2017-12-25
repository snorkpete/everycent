import { Component, OnInit } from '@angular/core';
import {SinkFundData} from './sink-fund-data.model';
import {SinkFundService} from './sink-fund.service';
import {MainToolbarService} from '../shared/main-toolbar/main-toolbar.service';

@Component({
  selector: 'ec-sink-funds',
  styles: [`
  `],
  template: `
    <ec-sink-fund [sinkFund]="sinkFund"></ec-sink-fund>
  `,
})
export class SinkFundsComponent implements OnInit {

  sinkFund: SinkFundData;
  sinkFunds: SinkFundData[];

  constructor(
    private sinkFundService: SinkFundService,
    private toolbarService: MainToolbarService
  ) { }

  ngOnInit() {
    this.sinkFundService.getSinkFunds().subscribe(sinkFunds => {
      this.sinkFunds = sinkFunds;
    });
    this.sinkFundService.refreshSinkFund();
    this.sinkFundService.getCurrent().subscribe(sinkFund => {
      this.sinkFund = sinkFund;
    });

    this.toolbarService.setHeading('Sink Fund Obligations');
  }

}
