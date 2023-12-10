import { TestBed } from "@angular/core/testing";
import { TransactionData } from "../transaction-data.model";

import { AbnAmroImporterService } from "./abn-amro-importer.service";
import { TRANSACTION_IMPORTER_PROVIDERS } from "./transaction-importer.module";

describe("AbnAmroImporterService", () => {
  let importer: AbnAmroImporterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...TRANSACTION_IMPORTER_PROVIDERS]
    });
  });

  beforeEach(() => {
    importer = TestBed.inject(AbnAmroImporterService);
  });

  describe("#isDate", () => {
    it('returns false for "other text"', () => {
      expect(importer.isDate("other text")).toBeFalsy();
    });
    it('returns true for "today"', () => {
      expect(importer.isDate("today")).toBeTruthy();
    });
    it('returns true for "yesterday"', () => {
      expect(importer.isDate("yesterday")).toBeTruthy();
    });
    it('returns true for "December 12, 2017"',() => {
      expect(importer.isDate("Saturday, December 9 • Betaalpas")).toBeTruthy();
    });
  });

  describe("#extractDate", () => {
    it('returns "2023-12-09" for "Saturday, December 9 • Betaalpas"', () => {
      expect(importer.extractDate("Saturday, December 9 • Betaalpas")).toEqual(
        new Date(2023, 11, 9, 10)
      );
    });
    it("returns current date for today", () => {
      expect(importer.extractDate("today", new Date("2017-01-01"))).toEqual(
        new Date("2017-01-01")
      );
    });
    it('returns the last date for "yesterday"', () => {
      expect(importer.extractDate("yesterday", new Date("2017-01-01"))).toEqual(
        new Date("2016-12-31")
      );
    });
  });

  describe("#isAmount", () => {
    it('returns true for "+ 410,00"', () => {
      expect(importer.isAmount("+ 410,00")).toBeTruthy();
    });
    it('returns true for "- 10,00"', () => {
      expect(importer.isAmount("- 10,00")).toBeTruthy();
    });
    it('returns true for "+ 4.110,00"', () => {
      expect(importer.isAmount("+ 4.110,00")).toBeTruthy();
    });
    it('returns false for "description"', () => {
      expect(importer.isAmount("description")).toBeFalsy();
    });
    it('returns false for "yesterday"', () => {
      expect(importer.isAmount("yesterday")).toBeFalsy();
    });
    it("returns false for blank lines", () => {
      expect(importer.isAmount("")).toBeFalsy();
    });
  });

  describe("#extractAmount", () => {
    it('returns true for "+ 410.00"', () => {
      expect(importer.extractAmount("+ 410.00")).toEqual(41000);
    });
    it('returns true for "- 7.90"', () => {
      expect(importer.extractAmount("- 7.90")).toEqual(-790);
    });
    it('returns true for "- 10.00"', () => {
      expect(importer.extractAmount("- 10.00")).toEqual(-1000);
    });
    it('returns true for "+ 4,110.00"', () => {
      expect(importer.extractAmount("+ 4,110.00")).toEqual(411000);
    });
    it("handles non amounts without errors", () => {
      expect(importer.extractAmount("test")).toEqual(0);
    });
  });

  describe("#isBlank", () => {
    it("returns true for empty strings", () => {
      expect(importer.isBlank("")).toBeTruthy();
    });
    it("returns false for non-empty strings", () => {
      expect(importer.isBlank("bal")).toBeFalsy();
    });
  });

  describe("#isDescription", () => {
    it("returns false for empty strings", () => {
      expect(importer.isDescription("")).toBeFalsy();
    });
    it("returns false for dates", () => {
      expect(importer.isDescription("today")).toBeFalsy();
      expect(importer.isDescription("yesterday")).toBeFalsy();
      expect(importer.isDescription("May 4, 2018")).toBeFalsy();
    });
    it("returns false for numbers", () => {
      expect(importer.isDescription("€+ 4.110,00")).toBeFalsy();
    });
  });

  describe('#isSkippableText', () => {
    // Yesterday
    // TM
    // TMC*G-ALM-Metr619,PAS363
    // Saturday, December 9 • Betaalpas
    // - 7.90
    // December 2023
    it('returns true for yesterday headings', () => {
      expect(importer.isSkippableText('Yesterday')).toBeTruthy();
    });
    it('returns true for today headings', () => {
      expect(importer.isSkippableText('Today')).toBeTruthy();
    });
    it('returns true for other date headings', () => {
      expect(importer.isSkippableText('December 2023')).toBeTruthy();
    });
    it('returns true for short two letter things', () => {
      expect(importer.isSkippableText('MX')).toBeTruthy();
    });
    it('returns false for dates', () => {
      expect(importer.isSkippableText('Saturday, December 9')).toBeFalse();
    });
    it('returns false for amounts', () => {
      expect(importer.isSkippableText('- 7.90')).toBeFalse();
    });
    it('returns false for decriptions', () => {
      expect(importer.isSkippableText('somethign else')).toBeFalse();
    });
  })

  describe("#convertFromBankFormat", () => {
    it("gets 5 transactions from the sample", () => {
      // simple fix to force the relative dates to have known values
      spyOn(importer, "currentDate").and.returnValue(new Date("2023-12-30"));

      let sample = `
Yesterday
TM
TMC*G-ALM-Metr619,PAS363
Saturday, December 9 • Betaalpas
- 7.90
FS
Febo Almere Stationspl,PAS363
Saturday, December 9 • Betaalpas
- 20.95
December 2023
AS
Amazon Payments Europe S
Friday, December 8 • iDEAL
+ 6.99
AS
Amazon Payments Europe S
Friday, December 8 • iDEAL
- 30.59
TM
TMC*G-ALM-Stadh608,PAS363
Friday, December 8 • Betaalpas
- 1.53
`;
      let result: TransactionData[] = importer.convertFromBankFormat(
        sample,
        "2023-12-01",
        "2023-12-24"
      );
      expect(result.length).toEqual(5);

      console.log(result);
      let first = result[0];
      expect(first.transaction_date).toEqual("2023-12-09");
      expect(first.withdrawal_amount).toEqual(790);
      expect(first.deposit_amount).toEqual(0);

      let third = result[2];
      expect(third.transaction_date).toEqual("2023-12-08");
      expect(third.withdrawal_amount).toEqual(0);
      expect(third.deposit_amount).toEqual(699);
      expect(third.description).toEqual('Amazon Payments Europe S');

      let fifth = result[4];
      expect(fifth.transaction_date).toEqual("2023-12-08");
      expect(fifth.withdrawal_amount).toEqual(153);
      expect(fifth.deposit_amount).toEqual(0);
      expect(fifth.description).toEqual("TMC*G-ALM-Stadh608,PAS363");
    });
  });
});
