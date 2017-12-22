import { AbstractControl, FormControl } from "@angular/forms";
import { TransactionDateValidatorDirective } from "./transaction-date-validator.directive";

describe("TransactionDateValidatorDirective", () => {
  let validator: TransactionDateValidatorDirective;
  let control: AbstractControl;

  beforeEach(() => {
    validator = new TransactionDateValidatorDirective();
    control = new FormControl();
  });

  it("should create an instance", () => {
    expect(validator).toBeTruthy();
  });

  it("returns invalid if date is not set", () => {
    control.setValue(null);
    expect(validator.validate(control)).toEqual({ required: true });
  });

  describe("with date set", () => {
    let theDateAsString = "2017-10-13";
    let theDate = new Date(theDateAsString);
    let dateBeforeTheDate = "2017-10-01";
    let dateAfterTheDate = "2017-10-20";

    beforeEach(() => {
      control.setValue(theDateAsString);
    });

    it("returns valid with no budget", () => {
      validator.budget = null;
      expect(validator.validate(control)).toEqual(null);
    });

    describe("handling budget start", () => {
      it("returns valid if budget start is null", () => {
        validator.budget = { start_date: null };
        expect(validator.validate(control)).toEqual(null);
      });

      it("returns valid if budget start is before transaction date", () => {
        validator.budget = { start_date: dateBeforeTheDate };
        expect(validator.validate(control)).toEqual(null);
      });

      it("returns invalid if budget start is after transaction date", () => {
        validator.budget = { start_date: dateAfterTheDate };
        expect(validator.validate(control)).toEqual({
          outOfRange: true,
          beforeBudgetPeriod: true
        });
      });

      it("returns valid if budget start  == transaction date", () => {
        validator.budget = { start_date: theDateAsString };
        expect(validator.validate(control)).toEqual(null);
      });
    });

    describe("handling budget end", () => {
      it("returns valid if budget end is null", () => {
        validator.budget = { end_date: null };
        expect(validator.validate(control)).toEqual(null);
      });

      it("returns valid if budget end is after transaction date", () => {
        validator.budget = { end_date: dateAfterTheDate };
        expect(validator.validate(control)).toEqual(null);
      });

      it("returns invalid if budget end is before transaction date", () => {
        validator.budget = { end_date: dateBeforeTheDate };
        expect(validator.validate(control)).toEqual({
          outOfRange: true,
          afterBudgetPeriod: true
        });
      });

      it("returns valid if budget end  == transaction date", () => {
        validator.budget = { end_date: theDateAsString };
        expect(validator.validate(control)).toEqual(null);
      });
    });
  });

});
