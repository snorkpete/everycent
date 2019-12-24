import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TransferFormComponent } from "./transfer-form/transfer-form.component";

@NgModule({
  declarations: [TransferFormComponent],
  entryComponents: [TransferFormComponent],
  imports: [CommonModule]
})
export class TransactionTransferModule {}
