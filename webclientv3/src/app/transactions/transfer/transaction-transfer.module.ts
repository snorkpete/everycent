import { NgModule } from "@angular/core";
import { SharedModule } from "../../shared/shared.module";
import { AccountTransferFormComponent } from "./account-transfer-form.component";

@NgModule({
  imports: [SharedModule.forRoot()],
  declarations: [AccountTransferFormComponent]
})
export class TransactionTransferModule {}
