import {Component, forwardRef, Input, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';



@Component({
  selector: 'ec-text-field',
  styles: [`
  `],
  template: `
    <md-input-container *ngIf="editMode">
        <input mdInput type="text" [(ngModel)]="value" [formControl]="control" class="value"/>
    </md-input-container>
    <span class="value" *ngIf="!editMode">{{value}}</span>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => TextFieldComponent )}
  ]
})
export class TextFieldComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  @Input() value: string;
  @Input() editMode: boolean;

  control = new FormControl('');

  private onChange: Function;
  private onTouch: Function;

  constructor() { }

  ngOnInit() {
    this.control.valueChanges.subscribe((v: string) => {
      this.onChange(v);
    });
  }

  ngAfterViewInit(): void {
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
