import { Injectable } from "@angular/core";
import { TransactionData } from "../transaction-data.model";

@Injectable()
export class FcbImporterService {
  constructor() {}

  convertFromCreditCardFormat(input: string, startDate: string, endDate: string) {
    throw new Error("not implemented yet");
  }

  convertFromBankFormat(input: string, startDate: string, endDate: string) {
    // SAMPLE DATA
    // 2017-09-10	SAVINGS WITHDRAWAL - ATM	$500.00	$0.00	$1,819.61
    // 2017-09-08	SAVINGS WITHDRAWAL - ATM	$500.00	$0.00	$2,319.61
    // 2017-09-06	ACH CREDIT MEMO	$0.00	$250.00	$2,819.61
    // 2017-09-02	SAVINGS WITHDRAWAL - ATM	$1,000.00	$0.00	$2,569.61
    // 2017-09-01	ABM Withdrawal Fee - SAV	$3.00	$0.00	$3,569.61

    // first split into lines
    let lines = this._convertInputToLines(input);

    // then split each line into its parts
    return lines.map(line => {
      return this._convertFCBankLineDataToTransaction(line, startDate, endDate);
    });
  }

  private _convertInputToLines(input) {
    if (!input) {
      return [];
    }
    return input.split(/[\n]/);
  }

  private _convertFCBankLineDataToTransaction(line, startDate, endDate) {
    let transaction: TransactionData = {};
    let parts = line.split("\t");
    transaction.transaction_date = new Date(parts[0]);
    transaction.description = parts[1];
    let withdrawalAsStringWithDollarSign = parts[2];
    let depositAsStringWithDollarSign = parts[3];

    transaction.withdrawal_amount = this.extractNumberFromDollarString(
      withdrawalAsStringWithDollarSign
    );
    transaction.deposit_amount = this.extractNumberFromDollarString(
      depositAsStringWithDollarSign
    );

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

    return transaction;
  }

  extractNumberFromDollarString(dollarString) {
    if (!dollarString) {
      return 0;
    }
    let amountWithCommas = dollarString.replace(/\$/g, "");
    let amountAsNumberInDollars = Number(amountWithCommas.replace(/,/g, ""));
    return amountAsNumberInDollars * 100;
  }
}
