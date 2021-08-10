import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { AllocationCategoriesComponent } from "./allocation-categories.component";
import { AllocationCategoryEditFormComponent } from "./allocation-category-edit-form.component";
import { BankAccountEditFormComponent } from "./bank-account-edit-form.component";
import { BankAccountsComponent } from "./bank-accounts.component";
import { InstitutionEditFormComponent } from "./institution-edit-form.component";
import { InstitutionsComponent } from "./institutions.component";
import { SettingsComponent } from "./settings.component";

import { SetupRoutingModule } from "./setup-routing.module";
import { SetupService } from "./setup.service";

@NgModule({
  imports: [SharedModule, SetupRoutingModule],
  declarations: [
    InstitutionsComponent,
    InstitutionEditFormComponent,
    SettingsComponent,
    BankAccountsComponent,
    BankAccountEditFormComponent,
    AllocationCategoryEditFormComponent,
    AllocationCategoriesComponent
  ],
  providers: [SetupService]
})
export class SetupModule {}
