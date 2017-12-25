import { Component, Input, OnInit } from "@angular/core";
import { SinkFundData } from "../sink-fund-data.model";

@Component({
  selector: "ec-sink-fund-selector",
  template: `
    <mat-card>
      <mat-card-content>
        <mat-form-field>
          <mat-select placeholder="Select a sink fund">
            <mat-option *ngFor="let sinkFund of sinkFunds" [value]="sinkFund.id">
              {{sinkFund.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </mat-card-content>
    </mat-card>
  `,
  styles: []
})
export class SinkFundSelectorComponent implements OnInit {
  @Input() sinkFunds: SinkFundData[] = [];

  constructor() {}

  ngOnInit() {}
}
