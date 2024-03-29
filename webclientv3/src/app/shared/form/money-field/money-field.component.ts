import { Component, forwardRef, Input, OnInit } from "@angular/core";
import {
  ControlValueAccessor,
  UntypedFormControl,
  NG_VALUE_ACCESSOR
} from "@angular/forms";
import { dollarsToCents } from "../../../util/dollars-to-cents";
import { centsToDollars } from "../../../util/cents-to-dollars";

@Component({
  selector: "ec-money-field",
  styles: [
    `
    .negative {
        color: darkred;
        font-weight: bold;
    }
    input, .value {
        text-align: right;
    }
    .positive {
        color: darkgreen;
        font-weight: bold;
    }
    mat-form-field, .value {
        width: 100%;
    }
    .value {
      font-size: 12px;
      font-family: Roboto, "Helvetica Neue", sans-serif;
    }
    :host.form .value {
      height: 35px;
      margin-top: 10px;
      margin-bottom: 20px;
      font-size: 16px;
    }
    .text-display {
      display: flex;
      flex-direction: column;
    }
    .label {
      font-size: 12px;
      font-weight: 400;
      line-height: 1.125;
      color: rgba(0,0,0,.54);
      font-family: Roboto, "Helvetica Neue", sans-serif;
    }
    .text-display:focus-within .label{
      color: #673ab7;
    }
  `
  ],
  template: `
      <mat-form-field *ngIf="editMode; else textDisplay ">
          <input #input matInput type="text"
                 (input)="updateInnerValue(input.value)"
                 (blur)="formatTextValue()"
                 [placeholder]="placeholder"
                 [class.negative]="isNegative()"
                 [formControl]="control" />
      </mat-form-field>

      <ng-template #textDisplay>
        <span class="text-display">
          <span class="label">{{placeholder}}</span>
          <span class="value" [class.negative]="isNegative()" [class.positive]="isPositive()">
            {{ value | ecMoney }}
          </span>
        </span>
      </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MoneyFieldComponent)
    }
  ]
})
export class MoneyFieldComponent implements OnInit, ControlValueAccessor {
  private valueInCents = 0;
  isDisabled = false;

  @Input() editMode: boolean;
  @Input() highlightPositive: false;
  @Input() placeholder: string;

  control = new UntypedFormControl(0);

  private onChange: Function = (_: any) => {};
  private onTouch: Function = (_: any) => {};

  constructor() {}

  @Input()
  get value(): number {
    return this.valueInCents;
  }

  set value(newValueInCents: number) {
    this.valueInCents = newValueInCents;
    this.control.setValue(centsToDollars(newValueInCents), {
      emitEvent: false
    });
  }

  ngOnInit() {}

  isNegative(): boolean {
    return this.value < 0;
  }

  isPositive(): boolean {
    return this.highlightPositive && !this.isNegative();
  }

  updateInnerValue(dollarValueString: string) {
    this.valueInCents = dollarsToCents(dollarValueString);
    this.onChange(this.valueInCents);
  }

  formatTextValue() {
    this.value = this.value;
  }

  writeValue(newValue: number): void {
    this.value = newValue;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
