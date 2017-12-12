import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {MatCheckboxChange} from "@angular/material";
import {TransactionData} from "../../../transactions/transaction-data.model";

@Component({
  selector: 'ec-paid-field',
  styles: [],
  template: `
    <mat-checkbox *ngIf="editMode; else textDisplay" [formControl]="control" (change)="updateInnerValue($event)"></mat-checkbox>
    <ng-template #textDisplay>
      <span class="value">{{ paidStatusDisplay }}</span>
    </ng-template>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => PaidFieldComponent )}
  ]
})
export class PaidFieldComponent implements OnInit, ControlValueAccessor {

  @Input() editMode = false;
  @Input() innerValue: string;
  control = new FormControl(false);

  private onChange: Function = (_: any) => {};
  private onTouch: Function = () => {};

  get paidStatusDisplay() {

    if (this.innerValue === 'paid') {
      return 'Yes';
    } else if (this.innerValue === 'unpaid') {
      return 'No';
    } else {
      return 'Unknown';
    }
  }

  get value() {
    return this.innerValue;
  }

  set value(newValue: string) {
    this.innerValue = newValue;
    this.control.setValue(this.value === 'paid');
  }

  constructor() { }

  ngOnInit() {
    // this.control.valueChanges.subscribe((v: boolean) => {
    //   this.onChange(v);
    //   this.innerValue = v ? 'paid' : 'unpaid';
    // });
  }

  updateInnerValue(changeEvent: MatCheckboxChange) {
    this.innerValue = changeEvent.checked ? 'paid' : 'unpaid';
    this.onChange(this.innerValue);
  }

  writeValue(newValue: string): void {
    this.value = newValue;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
}
