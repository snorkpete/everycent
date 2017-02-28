import { Component, OnInit } from '@angular/core';
import {SinkFundData} from './sink-fund-data.model';
import {SinkFundService} from './sink-fund.service';

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

  constructor(
    private sinkFundService: SinkFundService
  ) { }

  ngOnInit() {
    this.sinkFundService.getCurrent().subscribe(sinkFund => {
      this.sinkFund = sinkFund;
    });
  }

}
