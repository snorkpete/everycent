import { Injectable } from "@angular/core";
import {AbnAmroCreditCardImporterService} from "./abn-amro-credit-card-importer.service";
import {AbnAmroOldFormatImporterService} from "./abn-amro-old-format-importer.service";

@Injectable()
export class AbnAmroImporterService {
  constructor(
    private creditCardImporter: AbnAmroCreditCardImporterService,
    private oldImporter: AbnAmroOldFormatImporterService
  ) {}

  convertFromCreditCardFormat(input: string, startDate: string, endDate: string) {
    return this.creditCardImporter.convertToTransactions(input, startDate, endDate);
  }

  convertFromOldBankFormat(input: string, startDate: string, endDate: string) {
    return this.oldImporter.convertToTransactions(input, startDate, endDate);
  }

  convertFromBankFormat(input: string, startDate: string, endDate: string) {
    // SAMPLE DATA
    // today
    //
    // €- 33,80
    // Stichting Cent. Bureau R
    //
    // €- 33,80
    // Stichting Cent. Bureau R
    // yesterday
    //
    // €- 34,08
    // Albert Heijn Fr.8642 ALM,PAS361
    //
    // €+ 28,40
    // DOMINOS NL BY ADYEN

    let start = new Date(startDate);
    let end = new Date(endDate);

    let transactions = [];
    let transaction, currentDate, withdrawalAmount, depositAmount;
    let currentDescription = "";

    // first split into lines
    let lines = this._convertInputToLines(input);
    lines.forEach(line => {
      // skip blank lines
      if (this.isBlank(line)) {
        return;
      }
      if (this.isDate(line)) {
        currentDate = this.extractDate(line);
        return;
      }

      if (this.isNumber(line)) {
        let amount = this.extractAmount(line);
        if (amount < 0) {
          withdrawalAmount = Math.abs(amount);
          depositAmount = 0;
        } else {
          withdrawalAmount = 0;
          depositAmount = amount;
        }
        return;
      }

      if (this.isDescription(line)) {
        currentDescription = line;
      }

      if (this.isEndOfTransaction(line)) {
        transaction = {
          transaction_date: currentDate,
          description: currentDescription,
          withdrawal_amount: withdrawalAmount,
          deposit_amount: depositAmount,
          status: 'paid',
        };

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
        transaction.transaction_date = transaction.transaction_date.toISOString().substr(0, 10);
        transactions.push(transaction);
        currentDescription = "";
        withdrawalAmount = 0;
        depositAmount = 0;
      }
    });

    return transactions;
  }

  private _convertInputToLines(input) {
    if (!input) {
      return [];
    }
    return input.split(/[\n]/);
  }

  isDate(line) {
    if (!line) {
      return false;
    }
    if (line === 'today' || line === 'yesterday') {
      return true;
    }
    return this.isFormattedDate(line);
  }

  isFormattedDate(line) {
    let matchResult = line.match(/^(\d{1,2}) ([A-z]+) (\d{4})/);
    if (!matchResult) {
      return false;
    }

    // convert the month to a number
    const months = {
      'January': 0,
      'February': 1,
      'March': 2,
      'April': 3,
      'May': 4,
      'June': 5,
      'July': 6,
      'August': 7,
      'September': 8,
      'October': 9,
      'November': 10,
      'December': 11,
    };

    matchResult[2] = months[matchResult[2]];
    return matchResult;
  }

  // This is provided here to provide an easy entry point for mocking the current date
  // thus allowing for predictable test results
  currentDate() {
    return new Date();
  }

  extractDate(line, relativeTo = this.currentDate()): Date {
    if (!this.isDate(line)) {
      return undefined;
    }

    if (line === 'today') {
      return relativeTo;
    }

    if (line === 'yesterday') {
      let yesterday = new Date(relativeTo.valueOf());
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }

    let dateParts = this.isFormattedDate(line);
    // the '10' is to force the time to not be midnight
    // the browser is interpreting the time differently
    // and causing an 'off-by-one-day' error
    return new Date(dateParts[3], dateParts[2], dateParts[1], 10);
  }

  isAmount(line: string) {
    if (this.isDate(line)) {
      return false;
    }
    return line.trim().replace(/\./g, '').match(/€([+-]) (\d*,?\d*)/);
  }

  extractAmount(line: string): number {
    let matches = this.isAmount(line);
    if (!matches) {
      return 0;
    }
    let [_, sign, amountString] = matches;
    let amount = Number(amountString.replace(/,/g, '.'));
    amount = Math.round(amount * 100);
    if (sign === '-') {
      return amount * -1;
    } else {
      return amount;
    }
  }

  isBlank(line: string): boolean {
    if (!line) {
      return true;
    }
    return line.trim() === "";
  }

  isDescription(input: string) {
    return !this.isBlank(input) && !this.isDate(input) && !this.isAmount(input);
  }

  isNumber(line) {
    let firstChar = line.trim().substr(0, 1);

    return firstChar === "-" || firstChar === "+" || firstChar === '€';
  }

  isEndOfTransaction(line) {
    return this.isDescription(line);
  }

}
