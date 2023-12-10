import { Injectable } from "@angular/core";
import { AbnAmroCreditCardImporterService } from "./abn-amro-credit-card-importer.service";
import { AbnAmroOldFormatImporterService } from "./abn-amro-old-format-importer.service";

interface DateParts {
  year: string;
  month: string;
  day: string;
}

@Injectable()
export class AbnAmroImporterService {
  constructor(
    private creditCardImporter: AbnAmroCreditCardImporterService,
    private oldImporter: AbnAmroOldFormatImporterService
  ) {}

  convertFromCreditCardFormat(
    input: string,
    startDate: string,
    endDate: string
  ) {
    return this.creditCardImporter.convertToTransactions(
      input,
      startDate,
      endDate
    );
  }

  convertFromOldBankFormat(input: string, startDate: string, endDate: string) {
    return this.oldImporter.convertToTransactions(input, startDate, endDate);
  }

  convertFromBankFormat(input: string, startDate: string, endDate: string) {
    // SAMPLE DATA

    // TM
    // Yesterday
    // TM
    // TMC*G-ALM-Metr619,PAS363
    // Saturday, December 9 • Betaalpas
    // - 7.90
    // FS
    // Febo Almere Stationspl,PAS363
    // Saturday, December 9 • Betaalpas
    // - 20.95
    // December 2023
    // AS
    // Amazon Payments Europe S
    // Friday, December 8 • iDEAL
    // + 6.99
    // AS
    // Amazon Payments Europe S
    // Friday, December 8 • iDEAL
    // - 30.59
    // TM
    // TMC*G-ALM-Stadh608,PAS363
    // Friday, December 8 • Betaalpas
    // - 1.53

    let start = new Date(startDate);
    let end = new Date(endDate);

    let transactions = [];
    let transaction, currentDate, withdrawalAmount, depositAmount;
    let currentDescription = "";

    // first split into lines
    let lines = this._convertInputToLines(input);
    console.log(lines)
    lines.forEach(line => {
      // skip blank lines
      if (this.isBlank(line)) {
        return;
      }
      console.log(line)
      if (this.isSkippableText(line)) {
        return;
      }
      if (this.isDescription(line)) {
        currentDescription = line;
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

        // we've gotten to the end - let's create the transaction now
        transaction = {
          transaction_date: currentDate,
          description: currentDescription,
          withdrawal_amount: withdrawalAmount,
          deposit_amount: depositAmount,
          status: "paid"
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
        // but only if we already have a valid date
        // It's better to get 'something' from the import than nothing
        if (
          transaction.transaction_date &&
          transaction.transaction_date.toISOString
        ) {
          transaction.transaction_date = transaction.transaction_date
            .toISOString()
            .substring(0, 10);
        }
        transactions.push(transaction);
        currentDescription = "";
        withdrawalAmount = 0;
        depositAmount = 0;
      }
    });

    return transactions;
  }

  private _convertInputToLines(input: string | null): string[] {
    if (!input) {
      return [];
    }
    return input.split(/[\n]/);
  }



  isDate(line: string) {
    if (!line) {
      return false;
    }
    if (line === "today" || line === "yesterday") {
      return true;
    }
    return this.isFormattedDate(line);
  }

  isFormattedDate(line: string) {
    // convert the month to a number
    const months = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11
    };

    //   Friday, November 17 • ABN AMRO Bank N.V.

    // first, let's look for dates in format 00 Month year
    let matchResult = line.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), ([A-z]+) (\d{1,2})/);

    if (matchResult) {
      return {
        day: matchResult[3],
        month: months[matchResult[2]],
        year: this.currentDate().getFullYear()
      };
    }

    // if we don't find it, try again with format Month 00, year
    matchResult = line.match(/^([A-z]+) (\d{1,2}), (\d{4})/);
    if (matchResult) {
      return {
        month: months[matchResult[1]],
        day: matchResult[2],
        year: matchResult[3]
      };
    }

    return false;
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

    if (line === "today") {
      return relativeTo;
    }

    if (line === "yesterday") {
      let yesterday = new Date(relativeTo.valueOf());
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }

    let dateParts: any = this.isFormattedDate(line);
    // the '10' is to force the time to not be midnight
    // the browser is interpreting the time differently
    // and causing an 'off-by-one-day' error
    return new Date(dateParts.year, dateParts.month, dateParts.day, 10);
  }

  isAmount(line: string) {
    if (this.isDate(line)) {
      return false;
    }
    return line
      .trim()
      .replace(/\,/g, "")
      .match(/([+-]) (\d*.?\d*)/);
  }

  extractAmount(line: string): number {
    let matches = this.isAmount(line);
    if (!matches) {
      return 0;
    }
    let [_, sign, amountString] = matches;
    let amount = Number(amountString);
    amount = Math.ceil(amount * 100);
    if (sign === "-") {
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

  isSkippableText(line: string): boolean {
    if (line.length === 2) {
      return true;
    }
    if (line.match(/^(Yesterday|Today|January|February|March|April|May|June|July|August|September|October|November|December)/)) {
      return true;
    }

    if (this.isDate(line))  {
      return false;
    }

    return false;
  }

  isDescription(input: string) {
    return !this.isBlank(input) && !this.isDate(input) && !this.isAmount(input) && input.length > 2;
  }

  isNumber(line: string) {
    let firstChar = line.trim().substring(0, 1);

    return firstChar === "-" || firstChar === "+" || firstChar === "€";
  }

  isEndOfTransaction(line: string) {
    return this.isAmount(line);
  }
}
