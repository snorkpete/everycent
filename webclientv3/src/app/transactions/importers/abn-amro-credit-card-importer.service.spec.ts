import { TestBed, inject } from "@angular/core/testing";
import {TransactionData} from "../transaction-data.model";

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
  /** Tslint: ignore trailing-whitespace */
  let sample = `
IDEAL BETALING, DANK U
23 Dec | 07:11:32
€ 819,29Credit

IDEAL BETALING, DANK U
23 Dec | 07:11:32
€ 70,93Credit

DROPBOX DQ87HWQ7RJQT DB.TT/CCHELP IRL
22 Dec | 07:11:32
€ 8,59Debit

SAFARI BKS ONLINE-FLOW 800-775-7330 USA
20 Dec | 07:11:32
€ 172,31Debit

GOOGLE *GAMEHOUSE G.CO/HELPPAY# GBR
19 Dec | 07:11:32
€ 9,26Debit
 Extra Card
 `;

  it("#convertToTransactions extracts transactions", () => {
    spyOn(importer, "currentDate").and.returnValue(new Date('2017-12-20'));
    let transactions = importer.convertToTransactions(sample, '2017-12-19', '2017-12-23');
    expect(transactions.length).toEqual(5);

    let first: TransactionData = transactions[0];
    expect(first.transaction_date).toEqual('2017-12-23');
    expect(first.status).toEqual('unpaid');
    expect(first.description).toEqual('IDEAL BETALING, DANK U');
    expect(first.withdrawal_amount).toEqual(0);
    expect(first.deposit_amount).toEqual(81929);

    let third: TransactionData = transactions[2];
    expect(third.transaction_date).toEqual('2017-12-22');
    expect(third.status).toEqual('unpaid');
    expect(third.description).toEqual('DROPBOX DQ87HWQ7RJQT DB.TT/CCHELP IRL');
    expect(third.withdrawal_amount).toEqual(859);
    expect(third.deposit_amount).toEqual(0);
  });

  describe('#extractDate', () => {
    it('converts "20 Dec" to proper date', () => {
      let currentYear = new Date().getFullYear();
      expect(importer.extractDate("20 Dec | 07:11:32")).toEqual(`${currentYear}-12-20`);
    });
  });

  describe('#extractAmount', () => {
    it('converts "€ 9,26Debit" to "-926', () => {
      expect(importer.extractAmount("€ 9,26Debit")).toEqual(-926);
    });

   it('converts "€ 70,93Credit" to "7093', () => {
     expect(importer.extractAmount("€ 70,93Credit")).toEqual(7093);
   });
  });
});
