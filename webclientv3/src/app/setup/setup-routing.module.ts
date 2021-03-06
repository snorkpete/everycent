import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AllocationCategoriesComponent } from "./allocation-categories.component";
import { BankAccountsComponent } from "./bank-accounts.component";
import { InstitutionsComponent } from "./institutions.component";
import { SettingsComponent } from "./settings.component";

const routes: Routes = [
  { path: "allocation-categories", component: AllocationCategoriesComponent },
  { path: "institutions", component: InstitutionsComponent },
  { path: "bank-accounts", component: BankAccountsComponent },
  { path: "settings", component: SettingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule {}
