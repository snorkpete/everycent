import { TestBed } from "@angular/core/testing";
import { TransactionData } from "../transaction-data.model";

import { RepublicImporterService } from "./republic-importer.service";

describe("RepublicImporterService", () => {
  let importer: RepublicImporterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RepublicImporterService]
    });
  });

  beforeEach(() => {
    importer = TestBed.inject(RepublicImporterService);
  });

  /* tslint:disable:no-trailing-whitespace */
  let sample = `
1	30-07-2018 00:01:00		ABM- WDL SERVICE CHARGE	Debit  	TTD	-4.0
2	30-07-2018 00:01:00		POS- RIK SERVICES LIMITED	Debit  	TTD	-290.15
3	30-07-2018 00:01:00		POS- H. WILLIAMS BOOK STORE	Debit  	TTD	-207.99
4	30-07-2018 00:01:00		POS- INK STOP LTD	Debit  	TTD	-207.9
5	30-07-2018 00:01:00		POS- CELLMASTER	Debit  	TTD	-99.0
6	30-07-2018 00:01:00		POS- STARBUCKS	Debit  	TTD	-92.0
7	10-07-2018 00:01:00		POS- RITUALS COFFEE SHOP	Debit  	TTD	-21.0
8	30-08-2018 00:01:00		ABM- RBL PROMENADE #1	Debit  	TTD	-2500.0
  `;

  describe("#convertFromBankFormat", () => {
    it("finds the right number of transactions", () => {
      let transactions = importer.convertFromBankFormat(
        sample,
        "2018-07-01",
        "2018-09-30"
      );
      expect(transactions.length).toEqual(8);
      let firstTransaction: TransactionData = transactions[0];
      expect(firstTransaction.transaction_date).toEqual("2018-07-30");
    });

    it("excludes transactions outside the date range", () => {
      let transactions = importer.convertFromBankFormat(
        sample,
        "2018-07-11",
        "2018-07-31"
      );
      expect(transactions.length).toEqual(8);
      expect(transactions[6].deleted).toBeTruthy();
      expect(transactions[7].deleted).toBeTruthy();
    });
  });

  describe("#convertLineToTransaction", () => {
    let line = "7	30-07-2018 00:01:00		POS- RITUALS COFFEE SHOP	Debit  	TTD	-21.0";

    it("extracts transaction data from the line", () => {
      let result: TransactionData = importer.convertLineToTransaction(
        line,
        "2018-07-30",
        "2018-07-30"
      );
      expect(result.transaction_date).toEqual("2018-07-30");
      expect(result.deposit_amount).toEqual(0);
      expect(result.withdrawal_amount).toEqual(2100);
      expect(result.description).toEqual("POS- RITUALS COFFEE SHOP");
    });
  });

  describe("#isDate", () => {
    it("recognises '30-07-2018 00:01:00' as a Date", () => {
      expect(importer.extractDate("30-07-2018 00:01:00")).toBeTruthy();
      expect(importer.extractDate("30-07-2018 00:01:00")).toEqual(
        new Date(2018, 6, 30, 10)
      );
    });

    it("recognises '03-01-2018 00:01:00' as a Date", () => {
      expect(importer.extractDate("03-01-2018 00:01:00")).toEqual(
        new Date(2018, 0, 3, 10)
      );
    });

    it("recognises '3-07-2018 00:01:00' as a Date", () => {
      expect(importer.extractDate("3-07-2018 00:01:00")).toEqual(
        new Date(2018, 6, 3, 10)
      );
    });

    it("doesn't recognise undefined as a date", () => {
      expect(importer.extractDate(undefined)).toBeFalsy();
    });

    it("doesn't recognise '' as a date", () => {
      expect(importer.extractDate("")).toBeFalsy();
    });

    it("doesn't recognise 'POS- RITUALS COFFEE SHOP' as a date", () => {
      expect(importer.extractDate("POS- RITUALS COFFEE SHOP")).toBeFalsy();
    });
  });

  describe("#extractAmount", () => {
    it("extracts the amount properly", () => {
      expect(importer.extractAmount("-99.0")).toEqual(-9900);
      expect(importer.extractAmount("2500.0")).toEqual(250000);
      expect(importer.extractAmount("+25.0")).toEqual(2500);
    });
  });
});
