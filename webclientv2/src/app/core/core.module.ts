
import {NgModule} from "@angular/core";
import {ActionDispatcher} from "./action-dispatcher.service";
import {MdIconRegistry} from "@angular2-material/icon";
import {ApiGateway} from "./api-gateway.service";
@NgModule({
  providers:[ApiGateway, ActionDispatcher, MdIconRegistry]
})
export class CoreModule{}
