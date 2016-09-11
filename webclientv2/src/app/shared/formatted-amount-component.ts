import {Component, Input} from "@angular/core";

@Component({
  styles:[`
    .positive{
      color: green;
    }

    .negative{
      color: red;
      font-weight: bold;
    }
  `],
  selector: 'ec-amount-formatted',
  template: `
    <span ngClass="{ positive: amount >= 0, negative: amount < 0 }">
        {{ amount | ecToDollars }}
    </span>
  `
})
export class FormattedAmountComponent {
  @Input() public amount: number;
}