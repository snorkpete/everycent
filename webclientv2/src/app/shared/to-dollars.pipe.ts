import {Pipe, PipeTransform} from "@angular/core";

@Pipe({ name: 'ecToDollars' })
export class ToDollarsPipe implements PipeTransform{

  transform(input: any): string {
    return isNaN(input) ? (0).toFixed(2) : (input / 100).toFixed(2);
  }

}
