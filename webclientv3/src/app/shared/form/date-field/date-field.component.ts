import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'ec-date-field',
  styles: [`
  `],
  template: `
      <mat-input-container *ngIf="editMode">
          <input mdInput type="date" [(ngModel)]="value" [formControl]="control" class="value"/>
      </mat-input-container>
      <span class="value" *ngIf="!editMode">{{ value | date:'mediumDate' }}</span>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => DateFieldComponent )}
  ]
})
export class DateFieldComponent implements OnInit, ControlValueAccessor {

  @Input() value: Date;
  @Input() editMode: boolean;

  control = new FormControl();

  private onChange: Function = (_: any) => {};
  private onTouch: Function = () => {};

  constructor() { }

  ngOnInit() {
    this.control.valueChanges.subscribe((v: string) => {
      this.onChange(v);
    });
  }

  writeValue(newValue: Date): void {
    this.value = newValue;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
  }

}
