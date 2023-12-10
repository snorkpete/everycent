import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, UntypedFormControl, NG_VALUE_ACCESSOR} from '@angular/forms';

let FormType = {
  TEXT: 'text',
  DATE: 'date',
  MONEY: 'money',
  NONE: 'none',
};

export {FormType};

@Component({
  selector: 'ec-form-field',
  styles: [`
  `],
  template: `
    <ec-text-field *ngIf="type==FormType.TEXT" [editMode]="editMode" [(ngModel)]="value" [formControl]="control"></ec-text-field>
    <ec-date-field *ngIf="type==FormType.DATE" [editMode]="editMode" [(ngModel)]="value" [formControl]="control"></ec-date-field>
    <ec-money-field *ngIf="type==FormType.MONEY" [editMode]="editMode" [(ngModel)]="value" [formControl]="control"></ec-money-field>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => FormFieldComponent )}
  ]
})
export class FormFieldComponent implements OnInit, ControlValueAccessor {

  FormType = FormType;

  @Input() value: string | number | Date;
  @Input() editMode: boolean;
  @Input() type: string;

  control = new UntypedFormControl();

  private onChange: Function = (_: any) => {};
  private onTouch: Function = () => {};


  constructor() { }

  ngOnInit() {
    this.control.valueChanges.subscribe((v: string) => {
      this.onChange(v);
    });
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
