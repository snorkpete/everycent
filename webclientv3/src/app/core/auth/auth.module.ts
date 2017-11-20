import { NgModule } from '@angular/core';
import {ApiModule} from "../../../api/api.module";
import {AuthService} from "./auth.service";
import {AuthGuard} from "./auth-guard.service";

@NgModule({
  imports: [
    ApiModule,
  ],
  providers: [
    AuthService,
    AuthGuard,
  ]
})
export class AuthModule { }
