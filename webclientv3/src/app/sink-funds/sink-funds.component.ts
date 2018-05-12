import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { filter, map, takeUntil } from "rxjs/operators";
import { MainToolbarService } from "../shared/main-toolbar/main-toolbar.service";
import { SinkFundData } from "./sink-fund-data.model";
import { SinkFundSelectorComponent } from "./sink-fund-selector/sink-fund-selector.component";
import { SinkFundService } from "./sink-fund.service";

@Component({
  selector: "ec-sink-funds",
  styles: [
    `
  `
  ],
  template: `
    <mat-card class="main">
      <ec-sink-fund-selector #selector
                             [sinkFunds]="sinkFunds"
                             (change)="onSinkFundSelect($event)">
      </ec-sink-fund-selector>

      <ec-sink-fund [sinkFund]="sinkFund"></ec-sink-fund>
    </mat-card>
  `
})
export class SinkFundsComponent implements OnInit, OnDestroy {
  sinkFund: SinkFundData;
  sinkFunds: SinkFundData[];
  onDestroy$ = new Subject();

  @ViewChild("selector") selector: SinkFundSelectorComponent;

  constructor(
    private sinkFundService: SinkFundService,
    private toolbarService: MainToolbarService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.sinkFundService.getSinkFunds().subscribe(sinkFunds => {
      this.sinkFunds = sinkFunds;
    });
    this.activatedRoute.paramMap
      .pipe(
        map(param => Number(param.get("sink_fund_id"))),
        filter(sinkFundId => sinkFundId > 0),
        takeUntil(this.onDestroy$)
      )
      .subscribe(sinkFundId => this.selectSinkFund(sinkFundId));

    this.toolbarService.setHeading("Sink Fund Obligations");
    this.sinkFundService.getCurrent().subscribe(sinkFund => {
      this.sinkFund = sinkFund;
    });
  }

  onSinkFundSelect(event: any) {
    this.router.navigate([this.selector.value], {
      relativeTo: this.activatedRoute.parent
    });
  }

  private selectSinkFund(selectedSinkFund: number) {
    this.selector.value = selectedSinkFund;
    this.sinkFundService.refreshSinkFund(selectedSinkFund);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
