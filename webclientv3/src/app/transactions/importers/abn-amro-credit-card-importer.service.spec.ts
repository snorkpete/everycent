import { TestBed, inject } from "@angular/core/testing";
import { TransactionData } from "../transaction-data.model";

import { AbnAmroCreditCardImporterService } from "./abn-amro-credit-card-importer.service";

describe("AbnAmroCreditCardImporter.ServiceService", () => {
  let importer: AbnAmroCreditCardImporterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AbnAmroCreditCardImporterService]
    });
  });

  beforeEach(() => {
    importer = TestBed.get(AbnAmroCreditCardImporterService);
  });

  describe("convertInputToLines", () => {
    it("splits the input into multiple lines", () => {
      /** Tslint: ignore trailing-whitespace */
      let smallSample = `
 ONCOLOGICA UK LTD CHESTERFORD GBR
28 Jul | 23:21:00
€ 66,02Debit
 ONCOLOGICA UK LTD CHESTERFORD GBR
28 Jul | 23:12:24
€ 66,02Debit
      `;
      let lines = importer.convertInputToLines(smallSample);
      expect(lines.length).toEqual(6);
    });

    it("ignores blank lines", () => {
      /** Tslint: ignore trailing-whitespace */
      let smallSample = `
 ONCOLOGICA UK LTD CHESTERFORD GBR
28 Jul | 23:21:00

 ONCOLOGICA UK LTD CHESTERFORD GBR

      `;
      let lines = importer.convertInputToLines(smallSample);
      expect(lines.length).toEqual(3);
    });

    it("ignores 'Extra Card' lines", () => {
      /** Tslint: ignore trailing-whitespace */
      let smallSample = `
 ONCOLOGICA UK LTD CHESTERFORD GBR
28 Jul | 23:21:00
€ 66,02Debit
 Extra Card
 ONCOLOGICA UK LTD CHESTERFORD GBR
28 Jul | 23:12:24
€ 66,02Debit
 Extra Card
      `;
      let lines = importer.convertInputToLines(smallSample);
      expect(lines.length).toEqual(6);
    });

    it("ignores 'Reserved' lines", () => {
      /** Tslint: ignore trailing-whitespace */
      let smallSample = `
 NEXT RETAIL LTD STRATFORD GBR
7 Aug | 19:02:12
€ 28,46Debit
Reserved
      `;
      let lines = importer.convertInputToLines(smallSample);
      expect(lines.length).toEqual(3);
    });

    it("splits 'date-only' lines into multiple lines", () => {
      let smallSample = `
 GOOGLE PAYMENT IE LTD DUBLIN IRL
27 Jul€ 1,99Debit
something else
      `;

      const lines = importer.convertInputToLines(smallSample);
      expect(lines.length).toEqual(4);

      expect(lines[1]).toEqual("27 Jul | 12:00");
      expect(lines[2]).toEqual("€ 1,99Debit");
    });
  });

  /** Tslint: ignore trailing-whitespace */
  let sample = `
 NETFLIX.COM LOS GATOS USA
31 Jul | 12:56:44
€ 13,75Debit
 ONCOLOGICA UK LTD CHESTERFORD GBR
28 Jul | 23:21:00
€ 66,02Debit
 Extra Card
 ONCOLOGICA UK LTD CHESTERFORD GBR
28 Jul | 23:12:24
€ 66,02Debit
 Extra Card

 IDEAL BETALING, DANK U
2 Aug€ 1.237,63Credit
 GOOGLE *YOUTUBEPREMIUM 650-253-0000 GBR
30 Jul | 09:42:38
€ 17,99Debit
 ONCOLOGICA UK LTD CHESTERFORD GBR
29 Jul | 16:27:49
€ 66,02Debit
 Extra Card
 GOOGLE PAYMENT IE LTD DUBLIN IRL
27 Jul€ 1,99Debit
 Extra Card
 MEDIUM MONTHLY SAN FRANCISCO USA
27 Jul | 03:20:07
€ 4,33Debit
 `;

  it("#convertToTransactions extracts transactions", () => {
    spyOn(importer, "currentDate").and.returnValue(new Date("2021-07-31"));
    let transactions = importer.convertToTransactions(
      sample,
      "2021-07-25",
      "2021-08-05"
    );
    console.log(transactions);
    expect(transactions.length).toEqual(8);

    // confirm the first transaction is extracted properly
    // NETFLIX.COM LOS GATOS USA
    // 31 Jul | 12:56:44
    // € 13,75Debit
    let first: TransactionData = transactions[0];
    expect(first.transaction_date).toEqual("2021-07-31");
    expect(first.status).toEqual("unpaid");
    expect(first.description).toEqual("NETFLIX.COM LOS GATOS USA");
    expect(first.withdrawal_amount).toEqual(1375);
    expect(first.deposit_amount).toEqual(0);

    // Payments give trouble, so let's check that it gets extracted properly
    // IDEAL BETALING, DANK U
    // 2 Aug€ 1.237,63Credit
    let fourth: TransactionData = transactions[3];
    expect(fourth.transaction_date).toEqual("2021-08-02");
    expect(fourth.status).toEqual("unpaid");
    expect(fourth.description).toEqual("IDEAL BETALING, DANK U");
    expect(fourth.withdrawal_amount).toEqual(0);
    expect(fourth.deposit_amount).toEqual(123763);

    // let's also confirm we can handle weird situations where we have lines to ignore
    // GOOGLE PAYMENT IE LTD DUBLIN IRL
    // 27 Jul€ 1,99Debit
    // Extra Card
    let seventh = transactions[6];
    expect(seventh.transaction_date).toEqual("2021-07-27");
    expect(seventh.status).toEqual("unpaid");
    expect(seventh.description).toEqual("GOOGLE PAYMENT IE LTD DUBLIN IRL");
    expect(seventh.withdrawal_amount).toEqual(199);
    expect(seventh.deposit_amount).toEqual(0);
  });

  describe("#extractDate", () => {
    it('converts "20 Dec" to proper date', () => {
      let currentYear = new Date().getFullYear();
      expect(importer.extractDate("20 Dec | 07:11:32")).toEqual(
        `${currentYear}-12-20`
      );
    });

    it('converts"2 Aug" to a proper date', () => {
      let currentYear = new Date().getFullYear();
      expect(importer.extractDate("2 Dec | 07:11:32")).toEqual(
        `${currentYear}-12-02`
      );
    });
  });

  describe("#extractAmount", () => {
    it('converts "€ 9,26Debit" to "-926', () => {
      expect(importer.extractAmount("€ 9,26Debit")).toEqual(-926);
    });

    it('converts "€ 70,93Credit" to "7093', () => {
      expect(importer.extractAmount("€ 70,93Credit")).toEqual(7093);
    });
  });
});
