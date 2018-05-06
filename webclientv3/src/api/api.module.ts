import {HttpClientModule} from "@angular/common/http";
import {NgModule} from "@angular/core";
import {ApiGateway} from "./api-gateway.service";
@NgModule({
  imports: [
    HttpClientModule,
  ],
  providers: [
    ApiGateway
  ]
})
export class ApiModule { }
