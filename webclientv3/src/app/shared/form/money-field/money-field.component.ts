import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';
import {dollarsToCents} from '../../../util/dollars-to-cents';
import {centsToDollars} from '../../../util/cents-to-dollars';

@Component({
  selector: 'ec-money-field',
  styles: [`
    .negative {
        color: darkred;
        font-weight: bold;
    }
    input {
        text-align: right;
    }
  `],
  template: `
      <md-input-container *ngIf="editMode">
          <input #input mdInput class="value" type="text"
                 (input)="updateInnerValue(input.value)"
                 (blur)="formatTextValue()"
                 [class.negative]="isNegative()"
                 [formControl]="control" />
      </md-input-container>
      <span class="value"
            [class.negative]="isNegative()"
            *ngIf="!editMode">{{ value | ecMoney }}</span>
  `,
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => MoneyFieldComponent)},
  ]
})
export class MoneyFieldComponent implements OnInit, ControlValueAccessor {

  private valueInCents = 0;
  isDisabled = false;

  @Input() editMode: boolean;
  control = new FormControl(0);

  private onChange: Function = (_: any) => {};
  private onTouch: Function = (_: any) => {};

  constructor() { }

  @Input()
  get value(): number {
    return this.valueInCents;
  };

  set value(newValueInCents: number) {
    this.valueInCents = newValueInCents;
    this.control.setValue(centsToDollars(newValueInCents));
  }

  ngOnInit() {
  }

  isNegative(): boolean {
    return this.value < 0;
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
