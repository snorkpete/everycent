import {NgModule} from '@angular/core';
import {SharedModule} from "../../shared/shared.module";
import {AbnAmroCreditCardImporterService} from "./abn-amro-credit-card-importer.service";
import {AbnAmroImporterService} from "./abn-amro-importer.service";
import {AbnAmroOldFormatImporterService} from "./abn-amro-old-format-importer.service";
import {FcbImporterService} from "./fcb-importer.service";
import {ScotiaImporterService} from "./scotia-importer.service";
import {TransactionImporterService} from "./transaction-importer.service";
import {TransactionImporterComponent} from "./transaction-importer/transaction-importer.component";

let TRANSACTION_IMPORTER_PROVIDERS = [
  TransactionImporterService,
  FcbImporterService,
  ScotiaImporterService,
  AbnAmroImporterService,
  AbnAmroOldFormatImporterService,
  AbnAmroCreditCardImporterService,
];

export {TRANSACTION_IMPORTER_PROVIDERS};

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    TransactionImporterComponent,
  ],
  entryComponents: [
    TransactionImporterComponent,
  ],
  providers: [
    ...TRANSACTION_IMPORTER_PROVIDERS,
  ]
})
export class TransactionImporterModule { }
