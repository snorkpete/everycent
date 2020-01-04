import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../shared/shared.module";
import { AccountTransferFormComponent } from "./account-transfer-form.component";

@NgModule({
  imports: [SharedModule.forRoot()],
  declarations: [AccountTransferFormComponent],
  entryComponents: [AccountTransferFormComponent]
})
export class TransactionTransferModule {}
