import { NgModule } from '@angular/core';
import {ApiModule} from "../../api/api.module";
import {AuthModule} from "./auth/auth.module";

@NgModule({
  imports: [
    ApiModule,
    AuthModule,
  ],
})
export class CoreModule { }
