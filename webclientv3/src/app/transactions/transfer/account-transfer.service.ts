import { Injectable } from "@angular/core";
import { ApiGateway } from "../../../api/api-gateway.service";
import { AccountTransferData } from "./account-transfer-data.model";

@Injectable({
  providedIn: "root"
})
export class AccountTransferService {
  constructor(private apiGateway: ApiGateway) {}

  transfer(bankTransferData: AccountTransferData) {
    const url = `/bank_accounts/${bankTransferData.from}/transfer`;
    return this.apiGateway.post(url, bankTransferData);
  }
}
