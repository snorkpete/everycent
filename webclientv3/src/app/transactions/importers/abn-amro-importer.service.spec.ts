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
    it('returns true for "Fri, 8 Mar • OUR REF: SW0803003306452"',() => {
      expect(importer.isDate("Fri, 8 Mar • OUR REF: SW0803003306452")).toBeTruthy();
    });
  });

  describe("#extractDate", () => {
    it('returns "2023-12-09" for "Fri, 8 Mar • OUR REF: SW0803003306452"', () => {
      expect(importer.extractDate("Fri, 8 Mar • OUR REF: SW0803003306452")).toEqual(
        new Date(2024, 2, 8, 10)
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
    it('returns true for "- 50.00"', () => {
      expect(importer.isAmount("- 50.00")).toBeTruthy();
    });
    it('returns true for "+ 15,295.01"', () => {
      expect(importer.isAmount("+ 15,295.01")).toBeTruthy();
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
    it('returns true for "- 50.00"', () => {
      expect(importer.extractAmount("- 50.00")).toEqual(-5000);
    });
    it('returns true for "+ 15,295.01"', () => {
      expect(importer.extractAmount("+ 15,295.01")).toEqual(1529501);
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
      expect(importer.isDescription("Fri, 8 Mar • OUR REF: SW0803003306452")).toBeFalsy();
    });
    it("returns false for numbers", () => {
      expect(importer.isDescription("+ 15,295.01")).toBeFalsy();
    });
  });

  describe('#isSkippableText', () => {
    // Today
    // March 2024
    // SL
    // Stichting Beheer Loterij
    // Wed, 27 Mar • Incasso algemeen doorlopend
    // - 25.00
    // Yesterday
    // TM
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
      expect(importer.isSkippableText('Wed, 27 Mar • Incasso algemeen doorlopend')).toBeFalse();
    });
    it('returns false for amounts', () => {
      expect(importer.isSkippableText('- 25.00')).toBeFalse();
    });
    it('returns false for decriptions', () => {
      expect(importer.isSkippableText('somethign else')).toBeFalse();
    });
  })

  describe("#convertFromBankFormat", () => {
    it("gets 5 transactions from the sample", () => {
      // simple fix to force the relative dates to have known values
      spyOn(importer, "currentDate").and.returnValue(new Date("2024-04-19"));

      let sample = `
March 2024
SL
Stichting Beheer Loterij
Wed, 27 Mar • Incasso algemeen doorlopend
- 25.00
OS
OUR REF: SW0803003306452
Fri, 8 Mar • OUR REF: SW0803003306452
+ 15,295.01
KC
KJ STEPHEN CJ
Mon, 4 Mar • Overboeking
+ 75.00
February 2024
CV
Coffeeshop Vondel,PAS362
Sat, 24 Feb • Betaalpas
- 50.00
BO
Best Friends Zuid Oost,PAS362
Thu, 1 Feb • Betaalpas
- 22.50
`;
      let result: TransactionData[] = importer.convertFromBankFormat(
        sample,
        "2024-02-01",
        "2024-03-31"
      );
      expect(result.length).toEqual(5);

      console.log(result);
      let first = result[0];
      expect(first.transaction_date).toEqual("2024-03-27");
      expect(first.withdrawal_amount).toEqual(2500);
      expect(first.deposit_amount).toEqual(0);

      let third = result[2];
      expect(third.transaction_date).toEqual("2024-03-04");
      expect(third.withdrawal_amount).toEqual(0);
      expect(third.deposit_amount).toEqual(7500);
      expect(third.description).toEqual('KJ STEPHEN CJ');

      let fifth = result[4];
      expect(fifth.transaction_date).toEqual("2024-02-01");
      expect(fifth.withdrawal_amount).toEqual(2250);
      expect(fifth.deposit_amount).toEqual(0);
      expect(fifth.description).toEqual("Best Friends Zuid Oost,PAS362");
    });
  });
});
