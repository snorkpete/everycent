import { Injectable } from '@angular/core';
import {ApiGateway} from "../../api/api-gateway.service";
import {Observable} from "rxjs/Observable";
import {BankAccountData} from "./bank-account.model";

@Injectable()
export class BankAccountService {

  constructor(
    private apiGateway: ApiGateway
  ) { }

  getBankAccounts(): Observable<BankAccountData[]> {
    return this.apiGateway.get('/bank_accounts');
  }
}
