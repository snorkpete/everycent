import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { BankAccountsComponent } from "./bank-accounts.component";
import { InstitutionsComponent } from "./institutions.component";

import { SetupRoutingModule } from "./setup-routing.module";
import { SetupService } from "./setup.service";
import { InstitutionEditFormComponent } from "./institution-edit-form.component";
import { SettingsComponent } from "./settings.component";
import { BankAccountEditFormComponent } from "./bank-account-edit-form.component";

@NgModule({
  imports: [SharedModule, SetupRoutingModule],
  declarations: [
    InstitutionsComponent,
    InstitutionEditFormComponent,
    SettingsComponent,
    BankAccountsComponent,
    BankAccountEditFormComponent
  ],
  entryComponents: [InstitutionEditFormComponent, BankAccountEditFormComponent],
  providers: [SetupService]
})
export class SetupModule {}
