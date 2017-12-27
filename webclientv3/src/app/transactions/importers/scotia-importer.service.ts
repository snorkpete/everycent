import { Injectable } from "@angular/core";
import { TransactionData } from "../transaction-data.model";

@Injectable()
export class ScotiaImporterService {
  constructor() {}

  convertToTransactions(input: string, startDate: string, endDate: string, importType?: string) {
    return this._convertFromNewTransactionFormat(
      input,
      startDate,
      endDate,
      importType
    );
  }

  private _convertFromNewTransactionFormat(input, startDate, endDate, importType) {
    let lines = this._convertInputToLines(input);

    let transactionDataList = this._convertLinesToTransactionData(lines);
    return this._convertTransactionArrayDataToTransactions(
      transactionDataList,
      startDate,
      endDate,
      importType
    );
  }

  _convertInputToLines(input) {
    if (!input) {
      return [];
    }
    return input.split(/[\n]/);
  }

  _convertLinesToTransactionData(lines) {
    if (lines === []) {
      return [];
    }

    let NBR_DATA_LINES_PER_TRANSACTION = 4;

    let transactionDataList = [];
    let nbrLinesForCurrentTransaction = 0;
    let currentDataArray = [];

    lines.forEach(line => {
      currentDataArray.push(line);
      nbrLinesForCurrentTransaction++;

      if (nbrLinesForCurrentTransaction >= NBR_DATA_LINES_PER_TRANSACTION) {
        transactionDataList.push(currentDataArray);
        currentDataArray = [];
        nbrLinesForCurrentTransaction = 0;
      }
    });

    return transactionDataList;
  }

  _convertTransactionArrayDataToTransactions(
    transactionArrayList,
    startDate,
    endDate,
    importType
  ) {
    return transactionArrayList.map(transactionArray => {
      return this._convertTransactionArrayToTransaction(
        transactionArray,
        startDate,
        endDate,
        importType
      );
    });
  }

  _convertTransactionArrayToTransaction(
    transactionArray,
    startDate,
    endDate,
    importType
  ) {
    if (transactionArray.length !== 4) {
      return {};
    }

    // Sample Source Data  (with balance)
    //Aug 17
    //2016	POS PURCHASE
    //Other
    //-$52.00 TTD	$947.00 TTD

    // Sample Source Data  (without balance)
    //Aug 12
    //2016	CUSTOMER TRANSFER (B/DT)
    //Transfer
    //$75.00 TTD

    let monthAndDay = transactionArray[0];
    let yearAndLine1Description = transactionArray[1];
    let line2Description = transactionArray[2];
    let amountAndBalance = transactionArray[3];

    let yearAndLine1DescriptionArray = yearAndLine1Description.match(/*? yearAndLine1Description */
      /^(\d{4})\s+(.*)$/
    );
    let year = "";
    let line1Description = "";
    if (yearAndLine1DescriptionArray.length !== 3) {
      year = "";
      line1Description = "";
    } else {
      year = yearAndLine1DescriptionArray[1];
      line1Description = yearAndLine1DescriptionArray[2];
    }

    let signAndAmountArray = amountAndBalance.match(/^\s*(-?)\$(.*?)\sTTD/);
    let sign = "";
    let amount = "";
    if (signAndAmountArray.length !== 3) {
      sign = "";
      amount = "0";
    } else {
      sign = signAndAmountArray[1];
      amount = signAndAmountArray[2];
    }

    let transaction: TransactionData = {};
    transaction.transaction_date = new Date(monthAndDay + " " + year);
    transaction.description = line1Description + " " + line2Description;

    // remove any commas in the number string before atttempting to convert
    let amountAsNumber = Number(amount.replace(/,/g, ""));
    if (sign === "") {
      transaction.deposit_amount = amountAsNumber * 100;
      transaction.withdrawal_amount = 0;
    } else {
      transaction.deposit_amount = 0;
      transaction.withdrawal_amount = amountAsNumber * 100;
    }

    // for credit cards, normal charges are shown as positive,
    // and credit card payments are shown as negative,
    // so flip around the withdrawals and deposits
    if (importType === "credit-card") {
      let oldWithdrawal = transaction.withdrawal_amount;
      transaction.withdrawal_amount = transaction.deposit_amount;
      transaction.deposit_amount = oldWithdrawal;
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

    return transaction;
  }
}
