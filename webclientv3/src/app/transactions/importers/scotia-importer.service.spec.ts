import { TestBed } from "@angular/core/testing";

import { ScotiaImporterService } from "./scotia-importer.service";

describe("ScotiaImporterService", () => {
  let scotiaImporter: ScotiaImporterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScotiaImporterService]
    });
  });

  beforeEach(() => {
    scotiaImporter = TestBed.get(ScotiaImporterService);
  });

  it("should be created", () => {
    expect(scotiaImporter).toBeTruthy();
  });

  describe("#convertToTransactions", () => {
    let input = "";
    let startDate = "2015-01-23";
    let endDate = "2015-01-23";

    it("returns an empty list by default", () => {
      expect(
        scotiaImporter.convertToTransactions(input, startDate, endDate)
      ).toEqual([]);
    });

    describe("when handling a normal POS transaction", () => {
      xit("returns a transaction list with one transaction", () => {
        input =
          "01/23/2015		\n" +
          "POS FEE (DEBIT)\n" +
          "0010092 SAMANTHA SINGH\n" +
          "PORT OF SPAINTT\n" +
          "$0.75 TTD	\n";
        let result = scotiaImporter.convertToTransactions(
          input,
          startDate,
          endDate,
          "bank-account"
        );
        expect(result.length).toEqual(1);
        expect(result[0].transaction_date).toEqual(
          new Date("2015-01-23T10:00:00-04:00")
        );
        expect(result[0].withdrawal_amount).toEqual(75);
        expect(result[0].deposit_amount).toEqual(0);
        //TODO: to fix
        // expect(result[0].description).toEqual('SAMANTHA SINGH');
      });

      xit("handles service charge transactions", () => () => {
        input =
          "02/23/2015		\n" +
          "SERVICE CHARGE SBQIBQSBFIBF\n" +
          "0568053 MARAVAL ROAD\n" +
          "POS T\n" +
          "$4.00 TTD		\n" +
          "02/23/2015	\n";
        let result = scotiaImporter.convertToTransactions(
          input,
          startDate,
          endDate
        );
        expect(result.length).toEqual(1);
        expect(result[0].transaction_date).toEqual(new Date("02/23/2015"));
        expect(result[0].withdrawal_amount).toEqual(400);
        expect(result[0].deposit_amount).toEqual(0);
        expect(result[0].description).toEqual("SERVICE CHARGE MARAVAL ROAD");
      });
    });
  });
});
