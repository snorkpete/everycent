import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import { MatSelect } from "@angular/material/select";
import { SinkFundData } from "../sink-fund-data.model";

@Component({
  selector: "ec-sink-fund-selector",
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `
  ],
  template: `
    <mat-card>
      <mat-card-content>
        <mat-form-field>
          <mat-select
            #field
            color="primary"
            placeholder="Select a sink fund"
            (selectionChange)="change.emit($event)"
          >
            <mat-option
              *ngFor="let sinkFund of sinkFunds"
              [value]="sinkFund.id"
            >
              {{ sinkFund.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </mat-card-content>
    </mat-card>
  `
})
export class SinkFundSelectorComponent implements OnInit {
  @Input() sinkFunds: SinkFundData[] = [];
  @Output() change = new EventEmitter();

  @ViewChild("field", { static: true }) field: MatSelect;

  get value() {
    if (this.field) {
      return this.field.value;
    }
    return 0;
  }

  set value(newValue: number) {
    this.field.value = newValue;
  }

  constructor() {}

  ngOnInit() {}
}
