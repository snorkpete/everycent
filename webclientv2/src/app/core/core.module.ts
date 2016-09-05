
import {NgModule} from "@angular/core";
import {ActionDispatcher} from "./action-dispatcher.service";
import {MdIconRegistry} from "@angular2-material/icon";
import {ApiGateway} from "./api-gateway.service";
import {Angular2TokenService} from "angular2-token";
import {AuthService} from "../auth/auth.service";
@NgModule({
  providers:[
    ApiGateway, ActionDispatcher,
    MdIconRegistry, Angular2TokenService,
    AuthService,
})
export class CoreModule{}
