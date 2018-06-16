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
  FormControl,
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
    .label {
      font-size: 12px;
      font-weight: bold;
      color: purple;
    }
  `],
  template: `
    <mat-form-field *ngIf="editMode; else textDisplay">
        <input #input matInput type="text" class="value"
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

  control = new FormControl("");

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
