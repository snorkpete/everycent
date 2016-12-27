
import {NgModule, Optional, SkipSelf} from "@angular/core";
import {ActionDispatcher} from "./action-dispatcher.service";
//import {MdIconRegistry} from "@angular/material";
import {ApiGateway} from "./api-gateway.service";
import {Angular2TokenService} from "angular2-token";
import {MessageService} from "./message.service";
import {LoadingIndicatorService} from "./loading-indicator.service";

@NgModule({
  providers:[
    ApiGateway, ActionDispatcher,
    //MdIconRegistry,
    Angular2TokenService,
    MessageService,
    LoadingIndicatorService
  ]
})
export class CoreModule{
  constructor(@Optional() @SkipSelf() parentModule: CoreModule){
    if(parentModule){
      throw new Error("CoreModule is already loaded. Import it in AppModule only!");
    }

  }
}
