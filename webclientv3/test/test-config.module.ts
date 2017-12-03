import {NgModule} from "@angular/core";
import {Http} from "@angular/http";
import {MatDialogRef} from "@angular/material";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {ApiGatewayStub} from "./stub-services/api-gateway-stub";
import {httpStub} from "./stub-services/http-stub";
import {MatDialogRefStub} from "./stub-services/mat-dialog-ref-stub";
import {RouterStub} from "./stub-services/router-stub";
import {Router} from "@angular/router";
import {ApiGateway} from "../src/api/api-gateway.service";
import {AccountBalancesService} from "../src/app/account-balances/account-balances.service";
import {AccountBalancesServiceStub} from "./stub-services/account-balances-service-stub";
import {TransactionService} from "../src/app/transactions/transaction.service";
import {TransactionServiceStub} from "./stub-services/transaction-service-stub";

@NgModule({
  imports: [
    NoopAnimationsModule,
  ],
  providers: [
    // library services
    { provide: Http, useValue: httpStub },
    { provide: MatDialogRef, useValue: MatDialogRefStub },
    { provide: Router, useValue: RouterStub },

    // core services
    { provide: ApiGateway, useValue: ApiGatewayStub},
    { provide: AccountBalancesService, useValue: AccountBalancesServiceStub },
    { provide: TransactionService, useValue: TransactionServiceStub },
  ],
})
export class TestConfigModule {}
