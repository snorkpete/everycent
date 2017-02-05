import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ApiGateway} from "./api-gateway.service";
import {HttpModule} from "@angular/http";
@NgModule({
  imports: [
    CommonModule,
    HttpModule,
  ],
  providers: [
    ApiGateway
  ]
})
export class ApiModule { }
