import {
  Component,
  forwardRef,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild
} from "@angular/core";
import {
  ControlValueAccessor,
  UntypedFormControl,
  NG_VALUE_ACCESSOR
} from "@angular/forms";

@Component({
  selector: "ec-text-field",
  styles: [
    `
    mat-form-field {
        width: 100%;
    }
    .text-display {
      display: flex;
      flex-direction: column;
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
    <mat-form-field *ngIf="editMode; else textDisplay">
        <input #input matInput [type]="type"
               (input)="updateValue(input.value)"
               [placeholder]="placeholder"
               [formControl]="control" />
    </mat-form-field>
    <ng-template #textDisplay>
      <span class="text-display">
        <span class="label">{{placeholder}}</span>
        <span class="value">{{value}}</span>
      </span>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => TextFieldComponent)
    }
  ]
})
export class TextFieldComponent
  implements OnInit, AfterViewInit, ControlValueAccessor {
  @Input() value: string;
  @Input() editMode: boolean;
  @Input() placeholder: string;
  @Input() type = "text";

  control = new UntypedFormControl("");

  private onChange: Function = (_: any) => {};
  private onTouch: Function = () => {};

  constructor() {}

  ngOnInit() {
    this.control.valueChanges.subscribe((v: string) => {
      this.onChange(v);
    });
  }

  ngAfterViewInit(): void {}

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
