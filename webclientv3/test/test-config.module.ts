import {NgModule} from "@angular/core";
import {ApiGateway} from "../src/api/api-gateway.service";
import {ApiGatewayStub} from "./api-gateway-stub";
import {Http} from "@angular/http";
import {httpStub} from "./http-stub";
import {Router} from "@angular/router";
import {RouterStub} from "./router-stub";
import {AccountBalancesService} from "../src/app/account-balances/account-balances.service";
import {AccountBalancesServiceStub} from "./account-balances-service-stub";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
  imports: [
    NoopAnimationsModule,
  ],
  providers: [
    { provide: ApiGateway, useValue: ApiGatewayStub},
    { provide: Http, useValue: httpStub },
    { provide: Router, useValue: RouterStub },
    { provide: ApiGateway, useValue: ApiGatewayStub},
    { provide: AccountBalancesService, useValue: AccountBalancesServiceStub },
  ],
})
export class TestConfigModule {}
