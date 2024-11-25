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

    // March 2024
    // SL
    // Stichting Beheer Loterij
    // Wed, 27 Mar • Incasso algemeen doorlopend
    // - 25.00
    // OS
    // OUR REF: SW0803003306452
    // Fri, 8 Mar • OUR REF: SW0803003306452
    // + 15,295.01
    // KC
    // KJ STEPHEN CJ
    // Mon, 4 Mar • Overboeking
    // + 75.00
    // February 2024
    // CV
    // Coffeeshop Vondel,PAS362
    // Sat, 24 Feb • Betaalpas
    // - 50.00
    // BO
    // Best Friends Zuid Oost,PAS362
    // Thu, 1 Feb • Betaalpas
    // - 22.50

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
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11
    };

    // old version -to delete //   Friday, November 17 • ABN AMRO Bank N.V.
    // Fri, 8 Mar • OUR REF: SW0803003306452

    // first, let's look for dates in format Day, 00 Mon
    let matchResult = line.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{1,2}) ([A-z]{3}) /);

    if (matchResult) {
      return {
        day: matchResult[2],
        month: months[matchResult[3]],
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
      .replace('Amount:', '')
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

    if (line.trim().startsWith(`Amount:`)) {
      return true;
    }
    return firstChar === "-" || firstChar === "+" || firstChar === "€";
  }

  isEndOfTransaction(line: string) {
    return this.isAmount(line);
  }
}
