import {NgModule} from "@angular/core";
import {ApiGateway} from "./api-gateway.service";
import {HttpModule} from "@angular/http";
@NgModule({
  imports: [
    HttpModule,
  ],
  providers: [
    ApiGateway
  ]
})
export class ApiModule { }
