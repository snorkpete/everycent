import { Injectable } from '@angular/core';

@Injectable()
export class AbnAmroOldFormatImporterService {

  constructor() { }

  convertToTransactions(input: string, startDate: string, endDate: string) {
    // SAMPLE DATA
    // 3 Nov \`17
    // Albert Heijn Fr.8642 ALM,PAS361
    // - 57,06
    // Het Beeldverhaal ALMERE ,PAS361
    // - 30,97
    // NL12RABO0306498111
    // TLS BV INZ. OV-CHIPKAART
    // NL12 RABO 0306 4981 11
    // - 50,00
    // 2 Nov \`17
    // NL12RABO0306498111
    // TLS BV INZ. OV-CHIPKAART
    // NL12 RABO 0306 4981 11
    // + 49,26

    let start = new Date(startDate);
    let end = new Date(endDate);

    let transactions = [];
    let transaction, currentDate, withdrawalAmount, depositAmount;
    let currentDescription = "";

    // first split into lines
    let lines = this._convertInputToLines(input);
    lines.forEach(line => {
      if (this.isDate(line)) {
        currentDate = this.extractDate(line);
        return;
      }

      if (this.isNumber(line)) {
        let numberParts = this.extractNumberParts(line);
        if (numberParts.sign === "+") {
          depositAmount = numberParts.amount;
          withdrawalAmount = 0;
        } else {
          depositAmount = 0;
          withdrawalAmount = numberParts.amount;
        }

        // it's a description, but exclude bank stuff
      } else if (line.substr(0, 2) !== "NL") {
        currentDescription += line;
      }

      if (this.isEndOfTransaction(line)) {
        transaction = {
          transaction_date: currentDate,
          description: currentDescription,
          withdrawal_amount: withdrawalAmount,
          deposit_amount: depositAmount,
          status: 'unpaid',
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
    return line.match(/(\d\d?) ([A-z]{3}) `(\d\d)/) || this.isNewDateFormat(line);
  }

  isNewDateFormat(line) {
    return line.match(/^(\d{2})\-(\d{2})\-(\d{4})/);
  }

  extractDate(line) {
    if (!this.isDate(line)) {
      return undefined;
    }

    let dateParts = this.isNewDateFormat(line);
    if (dateParts) {
      return new Date(`${dateParts[3]}-${dateParts[2]}-${dateParts[1]}`);
    }

    return new Date(line.replace(/`/g, ""));
  }

  isNumber(line) {
    let firstChar = line.trim().substr(0, 1);

    return firstChar === "-" || firstChar === "+" || firstChar === '€';
  }

  extractNumberParts(line) {
    if (line.substr(0,1) === '€') {
      line = line.substr(1);
    }
    let sign = line.trim().substr(0, 1);
    let numberString = line
      .substring(1)
      .trim()
      .replace(/\./g, "")
      .replace(/,/g, ".");
    let amount = Number(numberString) * 100;

    return {
      sign: sign,
      amount: amount
    };
  }

  isEndOfTransaction(line) {
    return this.isNumber(line);
  }
}
