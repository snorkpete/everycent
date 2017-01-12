import {Component, OnInit, ViewChild, forwardRef, Input} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

export const MONEY_FIELD_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MoneyFieldComponent),
  multi: true
};

@Component({
  selector: 'ec-money-field',
  styles:[`
    md-input input{
      text-align: right;
    }
  `],
  template: `
    <md-input class="text-right" #input [value]="dollarValue()" (blur)="updateValue(input)" [readonly]="readonly">
<!--      <span md-prefix>
        <i class="material-icons app-input-icon">motorcycle</i>
        &nbsp;
      </span> -->
    </md-input>
  `,
  providers: [MONEY_FIELD_VALUE_ACCESSOR]
})
export class MoneyFieldComponent implements OnInit, ControlValueAccessor{

  @Input('value')
  public valueInCents: number;

  @Input()
  public readonly: boolean;

  private propagateChange = (_:any) => {};

  ngOnInit(){ }

  dollarValue(): string{
    return (this.valueInCents / 100).toFixed(2);
  }

  updateValue(input){
    let newCalculatedValue = Math.round(Number(input.value) * 100);
    this.valueInCents = newCalculatedValue;
    input.value = this.dollarValue();
    this.propagateChange(this.valueInCents);
  }

  writeValue(newValue: number): void {
    this.valueInCents = newValue;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }
}
