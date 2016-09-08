import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {LoginComponent} from "./login.component";
import {AuthService} from "./auth.service";
import {AuthGuard} from "./auth-guard.service";

@NgModule({
  declarations: [
    LoginComponent,
  ],
  imports: [SharedModule],
  exports:[
  ],
  providers: [
    AuthService,
    AuthGuard,
  ]
})
export class AuthModule{}
