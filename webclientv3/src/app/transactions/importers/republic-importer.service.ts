import { Injectable } from "@angular/core";
import { TransactionData } from "../transaction-data.model";

@Injectable({
  providedIn: "root"
})
export class RepublicImporterService {
  constructor() {}

  convertFromBankFormat(
    input: string,
    startDate: string,
    endDate: string
  ): TransactionData[] {
    // tslint:disable:no-trailing-whitespace
    /*
      Sample
      1	30-07-2018 00:01:00		ABM- WDL SERVICE CHARGE	Debit  	TTD	-4.0
      2	30-07-2018 00:01:00		POS- RIK SERVICES LIMITED	Debit  	TTD	-290.15
      3	30-07-2018 00:01:00		POS- H. WILLIAMS BOOK STORE	Debit  	TTD	-207.99
      4	30-07-2018 00:01:00		POS- INK STOP LTD	Debit  	TTD	-207.9
      5	30-07-2018 00:01:00		POS- CELLMASTER	Debit  	TTD	-99.0
      6	30-07-2018 00:01:00		POS- STARBUCKS	Debit  	TTD	-92.0
      7	30-07-2018 00:01:00		POS- RITUALS COFFEE SHOP	Debit  	TTD	-21.0
      8	30-07-2018 00:01:00		ABM- RBL PROMENADE #1	Debit  	TTD	-2500.0
    */
    let lines = this._convertInputToLines(input);
    return lines.map(line =>
      this.convertLineToTransaction(line, startDate, endDate)
    );
  }

  private _convertInputToLines(input: string) {
    if (!input) {
      return [];
    }

    return input.trim().split(/[\n]/);
  }

  convertLineToTransaction(line: string, startDate: string, endDate: string) {
    if (!line) {
      return {};
    }

    let lineParts = line.trim().split(/[\t]/);
    let transaction: TransactionData = {
      withdrawal_amount: 0,
      deposit_amount: 0,
      status: "paid"
    };
    let [
      counter,
      date,
      randomThing,
      description,
      debitOrCredit,
      currency,
      amountString
    ] = lineParts;
    transaction.transaction_date = this.extractDate(date);
    transaction.description = description;

    let amount = this.extractAmount(amountString);
    if (amount < 0) {
      transaction.withdrawal_amount = amount * -1;
    } else if (amount > 0) {
      transaction.deposit_amount = amount;
    }

    let start = new Date(startDate);
    let end = new Date(endDate);

    // confirm that the transaction date is within the period
    if (
      transaction.transaction_date < start ||
      transaction.transaction_date > end
    ) {
      transaction.deleted = true;
    }

    // also remove any transactions with 0 amounts
    if (
      transaction.withdrawal_amount === 0 &&
      transaction.deposit_amount === 0
    ) {
      transaction.deleted = true;
    }

    // Convert the transaction date back to a string
    // but only if we already have a valid date
    // It's better to get 'something' from the import than nothing
    if (
      transaction.transaction_date &&
      transaction.transaction_date.toISOString
    ) {
      transaction.transaction_date = transaction.transaction_date
        .toISOString()
        .substr(0, 10);
    }
    return transaction;
  }

  extractDate(linePart: string): Date {
    if (!linePart) {
      return undefined;
    }

    let dateParts = linePart.match(/(\d\d?)-(\d\d)-(\d\d\d\d)/);
    if (!dateParts) {
      return undefined;
    }

    let [_, day, month, year] = dateParts;
    return new Date(Number(year), Number(month) - 1, Number(day), 10);
  }

  extractAmount(linePart: string): number {
    return Number(linePart) * 100;
  }
}
