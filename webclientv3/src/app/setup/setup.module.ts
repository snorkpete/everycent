import {NgModule} from '@angular/core';
import {SharedModule} from "../shared/shared.module";
import {InstitutionsComponent} from './institutions.component';

import {SetupRoutingModule} from './setup-routing.module';
import {SetupService} from "./setup.service";
import { InstitutionEditFormComponent } from './institution-edit-form.component';

@NgModule({
  imports: [
    SharedModule,
    SetupRoutingModule
  ],
  declarations: [InstitutionsComponent, InstitutionEditFormComponent],
  entryComponents: [
    InstitutionEditFormComponent,
  ],
  providers: [
    SetupService
  ]
})
export class SetupModule { }
