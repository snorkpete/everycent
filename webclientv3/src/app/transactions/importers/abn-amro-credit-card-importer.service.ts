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
    // Convert string dates to Date objects for comparison
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Split input into lines and filter out empty lines
    const lines = this._convertInputToLines(input);

    const transactions = [];
    let currentDate = null;
    let lineIndex = 0;

    while (lineIndex < lines.length) {
      const line = lines[lineIndex];

      // Check if line is a date
      if (this.isDate(line)) {
        currentDate = this.extractDate(line);
        lineIndex++;
      }

      // Process description, cardholder, and amount lines
      // This can happen after a date line or after a previous transaction with the same date
      if (currentDate && lineIndex < lines.length) {
        // Next line should be description
        const currentDescription = lines[lineIndex];
        lineIndex++;

        // Check if the next line is an amount line (for IDEAL payments without cardholder)
        if (lineIndex < lines.length && this.isAmountLine(lines[lineIndex])) {
          const amountLine = lines[lineIndex];
          const amount = this.extractAmount(amountLine);

          // Create transaction object without cardholder
          const transaction: TransactionData = {
            transaction_date: this.formatDate(currentDate),
            description: currentDescription,
            withdrawal_amount: amount < 0 ? Math.abs(amount) : 0,
            deposit_amount: amount > 0 ? amount : 0,
            status: "unpaid"
          };

          // Mark transactions outside the date range as deleted
          if (currentDate < start || currentDate > end) {
            transaction.deleted = true;
          }

          // add to the list of transactions found
          transactions.push(transaction);

          lineIndex++;
        }
        // Next line should be cardholder (for regular transactions)
        else if (lineIndex < lines.length) {
          const currentCardholder = lines[lineIndex];
          lineIndex++;

          // Next line should be amount
          if (lineIndex < lines.length) {
            const amountLine = lines[lineIndex];
            const amount = this.extractAmount(amountLine);

            // Create transaction object with cardholder
            const transaction: TransactionData = {
              transaction_date: this.formatDate(currentDate),
              // let's skip adding the current card holder for now
              // description: `${currentDescription} (${currentCardholder})`,
              description: currentDescription,
              withdrawal_amount: amount < 0 ? Math.abs(amount) : 0,
              deposit_amount: amount > 0 ? amount : 0,
              status: "unpaid"
            };

            // Mark transactions outside the date range as deleted
            if (currentDate < start || currentDate > end) {
              transaction.deleted = true;
            }

            // add to the list of transactions found
            transactions.push(transaction);

            lineIndex++;
          }
        }
      } else {
        // Skip lines that don't match our pattern
        lineIndex++;
      }
    }

    return transactions;
  }

  private _convertInputToLines(input: string): string[] {
    if (!input) {
      return [];
    }
    return input.split(/[\n]/).map(line => line.trim()).filter(line => line !== "");
  }

  isDate(line: string): boolean {
    // Match patterns like "20 jul. 2025"
    return !!line.match(/^\d{1,2} [a-z]{3}\. \d{4}$/i);
  }

  extractDate(line: string): Date {
    const parts = line.match(/^(\d{1,2}) ([a-z]{3})\. (\d{4})$/i);
    if (!parts) {
      return null;
    }

    const [_, day, monthAbbr, year] = parts;

    // Map month abbreviations to month numbers (0-based)
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    const month = months[monthAbbr.toLowerCase()];
    return new Date(parseInt(year), month, parseInt(day));
  }

  formatDate(date: Date): string {
    if (!date) return "";
    return date.toISOString().substring(0, 10); // YYYY-MM-DD format
  }

  isAmountLine(line: string): boolean {
    // Check if the line matches the pattern for an amount line
    // Match patterns like "- € 2,99", "+ € 0,00", or "€ 0,00"
    return !!line
      // @ts-ignore
      .replaceAll('.', '')
      .match(/^([+-]\s*)?€\s*(\d+),(\d+)$/);
  }

  extractAmount(line: string): number {
    // Match patterns like "- € 2,99", "+ € 0,00", or "€ 0,00"
    const match = line
      // @ts-ignore
      .replaceAll('.', '')
      .match(/^([+-]\s*)?€\s*(\d+),(\d+)$/);
    if (!match) {
      return 0;
    }

    const [_, sign, whole, decimal] = match;
    const amount = parseInt(whole) * 100 + parseInt(decimal);

    return sign && sign.trim().startsWith('-') ? -amount : amount;
  }

  // This is provided here to provide an easy entry point for mocking the current date
  // thus allowing for predictable test results
  currentDate() {
    return new Date();
  }
}
