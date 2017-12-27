import { TestBed, inject } from "@angular/core/testing";
import { MatDialog, MatDialogRef } from "@angular/material";
import { TransactionData } from "../transaction-data.model";
import { AbnAmroImporterService } from "./abn-amro-importer.service";
import { FcbImporterService } from "./fcb-importer.service";
import { ScotiaImporterService } from "./scotia-importer.service";
import { TransactionImporterModule } from "./transaction-importer.module";

import { TransactionImporterService } from "./transaction-importer.service";
import { TransactionImporterComponent } from "./transaction-importer/transaction-importer.component";

describe("TransactionImporterService", () => {
  let importer: TransactionImporterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TransactionImporterModule]
    });
  });

  beforeEach(() => {
    importer = TestBed.get(TransactionImporterService);
  });

  xit(
    "should be created",
    inject(
      [TransactionImporterService],
      (service: TransactionImporterService) => {
        expect(service).toBeTruthy();
      }
    )
  );

  xdescribe("#showForm", () => {
    it("exists", () => {
      expect(importer.showForm).toBeDefined();
    });

    it("creates a dialog with the form", () => {
      let dialog: MatDialog = TestBed.get(MatDialog);
      let dialogOpenSpy = spyOn(dialog, "open").and.callThrough();
      let sampleTransactions: TransactionData[] = [
        { id: 1, description: "First" },
        { id: 2, description: "Second" }
      ];
      spyOn(importer, "convertToTransactions").and.returnValue(
        sampleTransactions
      );

      let dialogRef = importer.showForm();
      expect(dialogOpenSpy.calls.count()).toEqual(1);
      let args = dialogOpenSpy.calls.mostRecent().args;
      expect(args[0] instanceof TransactionImporterComponent).toBe(true);

      let closeCount = 0;
      dialogRef.afterClosed().subscribe(transactions => {
        expect(transactions).toEqual(sampleTransactions);
      });
      expect(closeCount).toEqual(1);
    });
  });
});
