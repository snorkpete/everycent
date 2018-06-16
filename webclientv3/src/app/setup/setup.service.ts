import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiGateway } from "../../api/api-gateway.service";
import { BankAccountData } from "../bank-accounts/bank-account.model";
import { InstitutionData } from "../bank-accounts/institution.model";

@Injectable()
export class SetupService {
  constructor(private apiGateway: ApiGateway) {}

  getInstitutions(): Observable<InstitutionData[]> {
    return this.apiGateway.get("/institutions");
  }

  addInstitution(institution: InstitutionData): Observable<InstitutionData> {
    return this.apiGateway.post("/institutions", institution);
  }

  saveInstitution(institution: InstitutionData): Observable<InstitutionData> {
    return this.apiGateway.put(`/institutions/${institution.id}`, institution);
  }

  createOrUpdateInstitution(
    institution: InstitutionData
  ): Observable<InstitutionData> {
    if (institution.id === 0) {
      return this.addInstitution(institution);
    } else {
      return this.saveInstitution(institution);
    }
  }

  getBankAccounts(): Observable<BankAccountData[]> {
    return this.apiGateway.get("/bank_accounts");
  }

  addBankAccount(bankAccount: BankAccountData) {
    return this.apiGateway.post("/bank_accounts", bankAccount);
  }

  saveBankAccount(bankAccount: BankAccountData): Observable<BankAccountData> {
    return this.apiGateway.put(`/bank_accounts/${bankAccount.id}`, bankAccount);
  }

  createOrUpdateBankAccount(
    bankAccount: BankAccountData
  ): Observable<BankAccountData> {
    if (bankAccount.id === 0) {
      return this.addBankAccount(bankAccount);
    } else {
      return this.saveBankAccount(bankAccount);
    }
  }
}
