import {Component, forwardRef, Input, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';



@Component({
  selector: 'ec-text-field',
  styles: [`
      mat-form-field {
          width: 100%;
      }
  `],
  template: `
    <mat-form-field *ngIf="editMode; else textDisplay">
        <input #input matInput type="text" class="value"
               (input)="updateValue(input.value)"
               [formControl]="control" />
    </mat-form-field>
    <ng-template #textDisplay>
      <span class="value">{{value}}</span>
    </ng-template>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => TextFieldComponent )}
  ]
})
export class TextFieldComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  @Input() value: string;
  @Input() editMode: boolean;

  control = new FormControl('');

  private onChange: Function = (_: any) => {};
  private onTouch: Function = () => {};

  constructor() { }

  ngOnInit() {
    this.control.valueChanges.subscribe((v: string) => {
      this.onChange(v);
    });
  }

  ngAfterViewInit(): void {
  }

  updateValue(newValue: string) {
    this.value = newValue;
  }

  writeValue(newValue: string): void {
    this.value = newValue;
    this.control.setValue(this.value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }


}
