import { Component, forwardRef, Input, OnInit, Optional } from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR
} from "@angular/forms";
import { BudgetData } from "../../../budgets/budget.model";
import { TransactionDateValidatorDirective } from "../../../transactions/transaction-date-validator.directive";

@Component({
  selector: "ec-date-field",
  styles: [
    `
      mat-form-field,
      .value {
        width: 100%;
      }
    `
  ],
  template: `
    <mat-form-field *ngIf="editMode; else textDisplay">
      <input
        #input
        matInput
        type="date"
        [value]="value"
        (input)="updateValueFromDateText(value)"
        [formControl]="control"
      />
      <mat-error>Date is outside of budget range</mat-error>
    </mat-form-field>
    <ng-template #textDisplay>
      <span class="value">{{ value | date: "mediumDate" }}</span>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => DateFieldComponent)
    }
  ]
})
export class DateFieldComponent implements OnInit, ControlValueAccessor {
  @Input() value: Date;
  @Input() editMode: boolean;
  // TODO: this should NOT be needed
  /* tslint:disable no-input-rename */
  @Input("ecValidateWithinBudget") budget: BudgetData = {};
  @Input() errorMessage: string;

  control = new FormControl();

  private onChange: Function = (_: any) => {};
  private onTouch: Function = () => {};

  constructor(
    @Optional() private validator: TransactionDateValidatorDirective
  ) {}

  ngOnInit() {
    this.control.valueChanges.subscribe((v: string) => {
      if (this.validator) {
        let errors = this.validator.validate(this.control);
        this.control.setErrors(errors);
      }
      this.onChange(v);
    });
  }

  updateValueFromDateText(dateValue: string): void {
    this.value = new Date(dateValue);
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

  setDisabledState(isDisabled: boolean): void {}
}
