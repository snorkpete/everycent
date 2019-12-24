import { Injectable } from "@angular/core";
import { ApiGateway } from "../../../api/api-gateway.service";
import { BankTransferData } from "./bank-transfer-data.model";

@Injectable({
  providedIn: "root"
})
export class BankTransferService {
  constructor(private apiGateway: ApiGateway) {}

  transfer(bankTransferData: BankTransferData) {
    const url = `/bank-accounts/${bankTransferData.from}/transfer`;
    return this.apiGateway.post(url, bankTransferData);
  }
}
