import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {InstitutionsComponent} from "./institutions.component";

const routes: Routes = [
  { path: 'institutions', component: InstitutionsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule { }
