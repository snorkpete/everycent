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

  let sample = `
today

€- 33,80
Stichting Cent. Bureau R

€- 33,80
Stichting Cent. Bureau R
yesterday

€- 34,08
Albert Heijn Fr.8642 ALM,PAS361

€+ 28,40
DOMINOS NL BY ADYEN
12 December 2017

€- 1,87
ABN AMRO Bank N.V.

€- 25,15
McDonald's Almere Ce ALM,PAS361

€- 10,00
NS- Almere Centr.102 ALM,PAS361

`;

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
    it('returns true for "12 December 2017"', () => {
      expect(importer.isDate("12 December 2017")).toBeTruthy();
    });
    it('returns true for "December 12, 2017"', () => {
      expect(importer.isDate("December 12, 2017")).toBeTruthy();
    });
  });

  describe("#extractDate", () => {
    it('returns "2017-12-23" for "12 December 2017"', () => {
      expect(importer.extractDate("12 December 2017")).toEqual(
        new Date(2017, 11, 12, 10)
      );
    });
    it('returns "2017-12-23" for "December 23, 2017"', () => {
      expect(importer.extractDate("December 23, 2017")).toEqual(
        new Date(2017, 11, 23, 10)
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
    it('returns true for "€+ 410,00"', () => {
      expect(importer.isAmount("€+ 410,00")).toBeTruthy();
    });
    it('returns true for "€- 10,00"', () => {
      expect(importer.isAmount("€- 10,00")).toBeTruthy();
    });
    it('returns true for "€+ 4.110,00"', () => {
      expect(importer.isAmount("€+ 4.110,00")).toBeTruthy();
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
    it('returns true for "€+ 410,00"', () => {
      expect(importer.extractAmount("€+ 410,00")).toEqual(41000);
    });
    it('returns true for "€- 10,00"', () => {
      expect(importer.extractAmount("€- 10,00")).toEqual(-1000);
    });
    it('returns true for "€+ 4.110,00"', () => {
      expect(importer.extractAmount("€+ 4.110,00")).toEqual(411000);
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
      expect(importer.isDescription("4 May 2018")).toBeFalsy();
    });
    it("returns false for numbers", () => {
      expect(importer.isDescription("€+ 4.110,00")).toBeFalsy();
    });
  });

  describe("#convertFromBankFormat", () => {
    it("gets 5 transactions from the sample", () => {
      // simple fix to force the relative dates to have known values
      spyOn(importer, "currentDate").and.returnValue(new Date("2017-12-30"));

      let result: TransactionData[] = importer.convertFromBankFormat(
        sample,
        "2017-12-28",
        "2017-12-31"
      );
      expect(result.length).toEqual(7);

      let first = result[0];
      expect(first.transaction_date).toEqual("2017-12-30");
      expect(first.withdrawal_amount).toEqual(3380);
      expect(first.deposit_amount).toEqual(0);

      let fourth = result[3];
      expect(fourth.transaction_date).toEqual("2017-12-29");
      expect(fourth.withdrawal_amount).toEqual(0);
      expect(fourth.deposit_amount).toEqual(2840);
      expect(fourth.description).toEqual("DOMINOS NL BY ADYEN");
    });
  });
});
