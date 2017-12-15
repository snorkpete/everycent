import { NgModule } from '@angular/core';
import {ApiModule} from "../../api/api.module";
import {SharedModule} from "../shared/shared.module";
import {AuthModule} from "./auth/auth.module";

@NgModule({
  imports: [
    ApiModule,
    AuthModule,
    SharedModule.forRoot(),
  ],
})
export class CoreModule { }
