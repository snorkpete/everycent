import {Directive, forwardRef, HostBinding, Input} from "@angular/core";
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator
} from "@angular/forms";
import { BudgetData } from "../budgets/budget.model";

@Directive({
  selector: "[ecValidateWithinBudget]",
  providers: [
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => TransactionDateValidatorDirective)
    }
  ]
})
export class TransactionDateValidatorDirective implements Validator {

  /* tslint:disable no-input-rename */
  @Input('ecValidateWithinBudget') budget: BudgetData = {};

  constructor() {}

  validate(c: AbstractControl): ValidationErrors | null {
    if (!c.value) {
      return { required: true };
    }

    if (!this.budget) {
      return null;
    }

    let dateValue = new Date(c.value);

    if (this.budget.start_date) {
      let startDate = new Date(this.budget.start_date);
      if (dateValue < startDate) {
        return { outOfRange: true, beforeBudgetPeriod: true };
      }
    }

    if (this.budget.end_date) {
      let endDate = new Date(this.budget.end_date);
      if (dateValue > endDate) {
        return { outOfRange: true, afterBudgetPeriod: true };
      }
    }

    return null;
  }
}
