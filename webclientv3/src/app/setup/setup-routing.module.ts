import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { InstitutionsComponent } from "./institutions.component";
import { SettingsComponent } from "./settings.component";

const routes: Routes = [
  { path: "institutions", component: InstitutionsComponent },
  { path: "settings", component: SettingsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule {}
