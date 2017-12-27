import { Injectable } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";
import { AbnAmroImporterService } from "./abn-amro-importer.service";
import { FcbImporterService } from "./fcb-importer.service";
import { ScotiaImporterService } from "./scotia-importer.service";

@Injectable()
export class TransactionImporterService {
  constructor(
    private fcbImporter: FcbImporterService,
    private abnAmroImporter: AbnAmroImporterService,
    private scotiaImporter: ScotiaImporterService
  ) {}

  convertToTransactions(input, startDate, endDate, importType) {
    if (importType === "fc-bank") {
      return this.fcbImporter.convertFromBankFormat(input, startDate, endDate);
    }
    if (importType === "fc-creditcard") {
      return this.fcbImporter.convertFromCreditCardFormat(
        input,
        startDate,
        endDate
      );
    }
    if (importType === "abn-amro-bank") {
      return this.abnAmroImporter.convertFromBankFormat(
        input,
        startDate,
        endDate
      );
    }
    if (importType === "abn-amro-creditcard") {
      return this.abnAmroImporter.convertFromCreditCardFormat(
        input,
        startDate,
        endDate
      );
    }
    return this.scotiaImporter.convertToTransactions(
      input,
      startDate,
      endDate,
      importType
    );
  }
}
