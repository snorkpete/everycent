import { Injectable } from "@angular/core";
import { TransactionData } from "../transaction-data.model";

@Injectable()
export class AbnAmroCreditCardImporterService {
  constructor() {}

  convertToTransactions(
    input: string,
    startDate: string,
    endDate: string
  ): TransactionData[] {
    let lines = this._convertInputToLines(input);
    const linesPerTransaction = 3;
    let nbrTransactions = lines.length / linesPerTransaction;

    let transactions: TransactionData[] = [];

    for (let i = 0; i < nbrTransactions; i++) {
      let descriptionData = lines[i * linesPerTransaction + 0];
      let dateData = lines[i * linesPerTransaction + 1];
      let amountData = lines[i * linesPerTransaction + 2];

      let amount = this.extractAmount(amountData);

      let transaction: TransactionData = {
        transaction_date: this.extractDate(dateData),
        description: descriptionData,
        withdrawal_amount: amount < 0 ? amount * -1 : 0,
        deposit_amount: amount > 0 ? amount : 0,
        status: "unpaid"
      };

      let transactionDate: Date;
      if (transaction.transaction_date instanceof Date) {
        transactionDate = transaction.transaction_date;
      } else {
        transactionDate = new Date(transaction.transaction_date);
      }

      if (
        transaction.transaction_date >= startDate &&
        transaction.transaction_date <= endDate
      ) {
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  private _convertInputToLines(input) {
    if (!input) {
      return [];
    }
    let lines = input.trim().split(/[\n]/);
    return lines.filter(
      line =>
        line.trim() !== "" &&
        line.trim() !== "Reserved" &&
        line.trim() !== "Extra Card"
    );
  }

  // This is provided here to provide an easy entry point for mocking the current date
  // thus allowing for predictable test results
  currentDate() {
    return new Date();
  }

  extractDate(monthAndDay: string): string {
    let currentYear = this.currentDate().getFullYear(); /*? monthAndDay */
    let dateParts = monthAndDay.match(/(\d+) ([A-z]{3}) | .+/);
    let [_, day, month] = dateParts; /*? dateParts */
    let months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12"
    };
    return `${currentYear}-${months[month]}-${day}`;
  }

  extractAmount(amountText: string): number {
    let parts = amountText.match(/€(.*)(Credit|Debit)/);
    let [_, numberPart, sign] = parts;
    let amount = Math.floor(Number(numberPart.replace(",", ".")) * 100);
    if (sign === "Credit") {
      return amount;
    } else {
      return amount * -1;
    }
  }
}
