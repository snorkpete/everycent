import { TestBed } from "@angular/core/testing";
import { TransactionData } from "../transaction-data.model";

import { AbnAmroCreditCardImporterService } from "./abn-amro-credit-card-importer.service";

describe("AbnAmroCreditCardImporterService", () => {
  let importer: AbnAmroCreditCardImporterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AbnAmroCreditCardImporterService]
    });
  });

  beforeEach(() => {
    importer = TestBed.inject(AbnAmroCreditCardImporterService);
  });

  describe("_convertInputToLines", () => {
    it("splits the input into multiple lines", () => {
      const input = `
        20 jul. 2025
        GOOGLE*GOOGLE PLAY APP G.CO/HELPPAYÄ IRL
        K.J. STEPHEN
        - € 2,99
      `;
      // @ts-ignore - accessing private method for testing
      const lines = importer._convertInputToLines(input);
      expect(lines.length).toEqual(4);
      expect(lines[0]).toEqual("20 jul. 2025");
      expect(lines[1]).toEqual("GOOGLE*GOOGLE PLAY APP G.CO/HELPPAYÄ IRL");
      expect(lines[2]).toEqual("K.J. STEPHEN");
      expect(lines[3]).toEqual("- € 2,99");
    });

    it("filters out empty lines", () => {
      const input = `
        20 jul. 2025

        GOOGLE*GOOGLE PLAY APP G.CO/HELPPAYÄ IRL

        K.J. STEPHEN

        - € 2,99

      `;
      // @ts-ignore - accessing private method for testing
      const lines = importer._convertInputToLines(input);
      expect(lines.length).toEqual(4);
    });

    it("returns an empty array for null or empty input", () => {
      // @ts-ignore - accessing private method for testing
      expect(importer._convertInputToLines(null)).toEqual([]);
      // @ts-ignore - accessing private method for testing
      expect(importer._convertInputToLines("")).toEqual([]);
    });
  });

  describe("isDate", () => {
    it("returns true for valid date lines", () => {
      expect(importer.isDate("20 jul. 2025")).toEqual(true);
      expect(importer.isDate("1 jan. 2025")).toEqual(true);
      expect(importer.isDate("31 dec. 2025")).toEqual(true);
    });

    it("returns false for invalid date lines", () => {
      expect(importer.isDate("GOOGLE*GOOGLE PLAY APP")).toEqual(false);
      expect(importer.isDate("K.J. STEPHEN")).toEqual(false);
      expect(importer.isDate("- € 2,99")).toEqual(false);
      expect(importer.isDate("20 jul 2025")).toEqual(false); // Missing dot
      expect(importer.isDate("20 jul. 25")).toEqual(false); // Year too short
    });
  });

  describe("extractDate", () => {
    it("extracts date from valid date lines", () => {
      const date1 = importer.extractDate("20 jul. 2025");
      expect(date1.getFullYear()).toEqual(2025);
      expect(date1.getMonth()).toEqual(6); // July is 6 (0-based)
      expect(date1.getDate()).toEqual(20);

      const date2 = importer.extractDate("1 jan. 2025");
      expect(date2.getFullYear()).toEqual(2025);
      expect(date2.getMonth()).toEqual(0); // January is 0
      expect(date2.getDate()).toEqual(1);
    });

    it("returns null for invalid date lines", () => {
      expect(importer.extractDate("GOOGLE*GOOGLE PLAY APP")).toEqual(null);
      expect(importer.extractDate("K.J. STEPHEN")).toEqual(null);
      expect(importer.extractDate("- € 2,99")).toEqual(null);
    });
  });

  describe("formatDate", () => {
    it("formats date as YYYY-MM-DD", () => {
      const date = new Date(2025, 6, 20); // July 20, 2025
      expect(importer.formatDate(date)).toEqual("2025-07-20");
    });

    it("returns empty string for null date", () => {
      expect(importer.formatDate(null)).toEqual("");
    });
  });

  describe("isAmountLine", () => {
    it("returns true for valid amount lines", () => {
      expect(importer.isAmountLine("- € 2,99")).toEqual(true);
      expect(importer.isAmountLine("+ € 0,00")).toEqual(true);
      expect(importer.isAmountLine("€ 0,00")).toEqual(true);
      expect(importer.isAmountLine("€ 10,50")).toEqual(true);
      expect(importer.isAmountLine("+ € 10,50")).toEqual(true);
      expect(importer.isAmountLine("- € 10,50")).toEqual(true);
      expect(importer.isAmountLine("-€ 5,75")).toEqual(true);
      expect(importer.isAmountLine("+€ 5,75")).toEqual(true);
      expect(importer.isAmountLine("- € 1.124,61")).toEqual(true); // With thousands separator
    });

    it("returns false for invalid amount lines", () => {
      expect(importer.isAmountLine("GOOGLE*GOOGLE PLAY APP")).toEqual(false);
      expect(importer.isAmountLine("K.J. STEPHEN")).toEqual(false);
      expect(importer.isAmountLine("20 jul. 2025")).toEqual(false);
    });
  });

  describe("extractAmount", () => {
    it("extracts negative amounts correctly", () => {
      expect(importer.extractAmount("- € 2,99")).toEqual(-299);
      expect(importer.extractAmount("- € 10,50")).toEqual(-1050);
      expect(importer.extractAmount("-€ 5,75")).toEqual(-575);
      expect(importer.extractAmount("- € 1.124,61")).toEqual(-112461); // With thousands separator
    });

    it("extracts positive amounts correctly", () => {
      expect(importer.extractAmount("+ € 10,50")).toEqual(1050);
      expect(importer.extractAmount("+€ 5,75")).toEqual(575);
      expect(importer.extractAmount("€ 10,50")).toEqual(1050);
      expect(importer.extractAmount("+ € 1.500,00")).toEqual(150000); // With thousands separator
    });

    it("extracts zero amounts correctly", () => {
      expect(importer.extractAmount("+ € 0,00")).toEqual(0);
      expect(importer.extractAmount("€ 0,00")).toEqual(0);
    });

    it("returns 0 for invalid amount lines", () => {
      expect(importer.extractAmount("GOOGLE*GOOGLE PLAY APP")).toEqual(0);
      expect(importer.extractAmount("K.J. STEPHEN")).toEqual(0);
      expect(importer.extractAmount("20 jul. 2025")).toEqual(0);
    });
  });

  describe("convertToTransactions", () => {
    // Sample data with regular transactions
    const regularSample = `20 jul. 2025
GOOGLE*GOOGLE PLAY APP G.CO/HELPPAYÄ IRL
K.J. STEPHEN
- € 2,99
16 jul. 2025
CELLULAR PLANET LOT 4 BAGNA T TTO
K.J. STEPHEN
- € 23,47`;

    // Sample data with IDEAL payments (no cardholder)
    const idealSample = `20 jul. 2025
IDEAL BETALING, DANK U
+ € 577,84
16 jul. 2025
IDEAL BETALING, DANK U
+ € 1.500,00`;

    // Sample data with multiple transactions per date
    const multipleSample = `6 jul. 2025
KLM NETHERLANDS GP AMSTELVEEN NLD
K.J. STEPHEN
- € 1.124,61
KLM NETHERLANDS GP AMSTELVEEN NLD
K.J. STEPHEN
- € 1.387,61
KLM NETHERLANDS GP AMSTELVEEN NLD
K.J. STEPHEN
- € 1.387,61`;

    // Sample data with mixed transaction types
    const mixedSample = `6 jul. 2025
KLM NETHERLANDS GP AMSTELVEEN NLD
K.J. STEPHEN
- € 1.124,61
IDEAL BETALING, DANK U
+ € 577,84
KLM NETHERLANDS GP AMSTELVEEN NLD
K.J. STEPHEN
- € 1.387,61`;

    it("extracts regular transactions correctly", () => {
      const transactions = importer.convertToTransactions(
        regularSample,
        "2025-07-01",
        "2025-07-31"
      );

      expect(transactions.length).toEqual(2);

      // First transaction
      expect(transactions[0].transaction_date).toEqual("2025-07-20");
      expect(transactions[0].description).toEqual("GOOGLE*GOOGLE PLAY APP G.CO/HELPPAYÄ IRL");
      expect(transactions[0].withdrawal_amount).toEqual(299);
      expect(transactions[0].deposit_amount).toEqual(0);
      expect(transactions[0].status).toEqual("unpaid");
      expect(transactions[0].deleted).toBeUndefined();

      // Second transaction
      expect(transactions[1].transaction_date).toEqual("2025-07-16");
      expect(transactions[1].description).toEqual("CELLULAR PLANET LOT 4 BAGNA T TTO");
      expect(transactions[1].withdrawal_amount).toEqual(2347);
      expect(transactions[1].deposit_amount).toEqual(0);
      expect(transactions[1].status).toEqual("unpaid");
      expect(transactions[1].deleted).toBeUndefined();
    });

    it("extracts IDEAL payments correctly", () => {
      const transactions = importer.convertToTransactions(
        idealSample,
        "2025-07-01",
        "2025-07-31"
      );

      expect(transactions.length).toEqual(2);

      // First transaction
      expect(transactions[0].transaction_date).toEqual("2025-07-20");
      expect(transactions[0].description).toEqual("IDEAL BETALING, DANK U");
      expect(transactions[0].withdrawal_amount).toEqual(0);
      expect(transactions[0].deposit_amount).toEqual(57784);
      expect(transactions[0].status).toEqual("unpaid");
      expect(transactions[0].deleted).toBeUndefined();

      // Second transaction
      expect(transactions[1].transaction_date).toEqual("2025-07-16");
      expect(transactions[1].description).toEqual("IDEAL BETALING, DANK U");
      expect(transactions[1].withdrawal_amount).toEqual(0);
      expect(transactions[1].deposit_amount).toEqual(150000);
      expect(transactions[1].status).toEqual("unpaid");
      expect(transactions[1].deleted).toBeUndefined();
    });

    it("handles multiple transactions per date correctly", () => {
      const transactions = importer.convertToTransactions(
        multipleSample,
        "2025-07-01",
        "2025-07-31"
      );

      expect(transactions.length).toEqual(3);

      // All transactions should have the same date
      transactions.forEach(transaction => {
        expect(transaction.transaction_date).toEqual("2025-07-06");
      });

      // First transaction
      expect(transactions[0].description).toEqual("KLM NETHERLANDS GP AMSTELVEEN NLD");
      expect(transactions[0].withdrawal_amount).toEqual(112461);

      // Second transaction
      expect(transactions[1].description).toEqual("KLM NETHERLANDS GP AMSTELVEEN NLD");
      expect(transactions[1].withdrawal_amount).toEqual(138761);

      // Third transaction
      expect(transactions[2].description).toEqual("KLM NETHERLANDS GP AMSTELVEEN NLD");
      expect(transactions[2].withdrawal_amount).toEqual(138761);
    });

    it("handles mixed transaction types correctly", () => {
      const transactions = importer.convertToTransactions(
        mixedSample,
        "2025-07-01",
        "2025-07-31"
      );

      expect(transactions.length).toEqual(3);

      // All transactions should have the same date
      transactions.forEach(transaction => {
        expect(transaction.transaction_date).toEqual("2025-07-06");
      });

      // First transaction (regular)
      expect(transactions[0].description).toEqual("KLM NETHERLANDS GP AMSTELVEEN NLD");
      expect(transactions[0].withdrawal_amount).toEqual(112461);
      expect(transactions[0].deposit_amount).toEqual(0);

      // Second transaction (IDEAL)
      expect(transactions[1].description).toEqual("IDEAL BETALING, DANK U");
      expect(transactions[1].withdrawal_amount).toEqual(0);
      expect(transactions[1].deposit_amount).toEqual(57784);

      // Third transaction (regular)
      expect(transactions[2].description).toEqual("KLM NETHERLANDS GP AMSTELVEEN NLD");
      expect(transactions[2].withdrawal_amount).toEqual(138761);
      expect(transactions[2].deposit_amount).toEqual(0);
    });

    it("marks transactions outside date range as deleted", () => {
      const transactions = importer.convertToTransactions(
        regularSample,
        "2025-07-17",
        "2025-07-25"
      );

      expect(transactions.length).toEqual(2);

      // First transaction (within range)
      expect(transactions[0].transaction_date).toEqual("2025-07-20");
      expect(transactions[0].deleted).toBeUndefined();

      // Second transaction (outside range)
      expect(transactions[1].transaction_date).toEqual("2025-07-16");
      expect(transactions[1].deleted).toEqual(true);
    });

    it("handles empty input correctly", () => {
      const transactions = importer.convertToTransactions(
        "",
        "2025-07-01",
        "2025-07-31"
      );

      expect(transactions.length).toEqual(0);
    });
  });
});
