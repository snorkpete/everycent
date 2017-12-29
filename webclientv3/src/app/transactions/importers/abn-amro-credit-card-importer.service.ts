import { Injectable } from '@angular/core';
import {TransactionData} from "../transaction-data.model";

@Injectable()
export class AbnAmroCreditCardImporterService {

  constructor() { }

  convertToTransactions(input: string, startDate: string, endDate: string): TransactionData[] {
    let lines = this._convertInputToLines(input);
    let nbrTransactions = lines.length / 4;

    let transactions: TransactionData[] = [];

    for (let i = 0; i < nbrTransactions; i++) {
      let descriptionData = lines[i * 4 + 0];
      let dateData = lines[i * 4 + 1];
      let amountData = lines[i * 4 + 2];
      let extraCardData = lines[i * 4 + 3];

      let amount = this.extractAmount(amountData);

      let transaction: TransactionData = {
        transaction_date: this.extractDate(dateData),
        description: descriptionData,
        withdrawal_amount: amount < 0 ? amount * -1 : 0,
        deposit_amount: amount > 0 ? amount : 0,
        status: 'unpaid',
      }

      if (transaction.transaction_date >= startDate && transaction.transaction_date <= endDate) {
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  private _convertInputToLines(input) {
    if (!input) {
      return [];
    }
    return input.trim().split(/[\n]/);
  }

  extractDate(monthAndDay: string): string {
    let currentYear = new Date().getFullYear();
    let dateParts = monthAndDay.match(/(\d+) (.+)/);
    let [_, day, month] = dateParts;
    let months = {
      'Jan': '01',
      'Feb': '02',
      'Mar': '03',
      'Apr': '04',
      'May': '05',
      'Jun': '06',
      'Jul': '07',
      'Aug': '08',
      'Sep': '09',
      'Oct': '10',
      'Nov': '11',
      'Dec': '12'
    };
    return `${currentYear}-${months[month]}-${day}`;
  }

  extractAmount(amountText: string): number {
    let parts = amountText.match(/€(.*)(Credit|Debit)/);
    let[_, numberPart, sign] = parts;
    let amount = Math.floor(Number(numberPart.replace(',', '.'))  * 100);
    if (sign === 'Credit') {
      return amount;
    } else {
      return amount * -1;
    }
  }
}
