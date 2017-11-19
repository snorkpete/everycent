import { Pipe, PipeTransform } from '@angular/core';
import {centsToDollars} from '../util/cents-to-dollars';

@Pipe({
  name: 'ecMoney'
})
export class MoneyPipe implements PipeTransform {

  transform(valueInCents: number): string {
    return centsToDollars(valueInCents);
  }

}
