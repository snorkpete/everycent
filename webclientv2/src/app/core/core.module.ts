
import {NgModule, Optional, SkipSelf} from "@angular/core";
import {ActionDispatcher} from "./action-dispatcher.service";
import {MdIconRegistry} from "@angular2-material/icon";
import {ApiGateway} from "./api-gateway.service";
import {Angular2TokenService} from "angular2-token";
import {AuthService} from "../auth/auth.service";
import {MessageService} from "./message.service";
import {AuthGuard} from "../auth/auth-guard.service";

@NgModule({
  providers:[
    ApiGateway, ActionDispatcher,
    MdIconRegistry, Angular2TokenService,
    MessageService
  ]
})
export class CoreModule{
  constructor(@Optional() @SkipSelf() parentModule: CoreModule){
    if(parentModule){
      throw new Error("CoreModule is already loaded. Import it in AppModule only!");
    }

  }
}
