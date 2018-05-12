import { Observable, of } from "rxjs";
import { BankAccountData } from "../../src/app/bank-accounts/bank-account.model";
import { InstitutionData } from "../../src/app/bank-accounts/institution.model";
import { SettingsData } from "../../src/app/shared/settings-data.model";

const SetupServiceStub = {
  getInstitutions(): Observable<InstitutionData[]> {
    return of([]);
  },

  addInstitution(institution: InstitutionData): Observable<InstitutionData> {
    return of([]);
  },

  saveInstitution(institution: InstitutionData): Observable<InstitutionData> {
    return of([]);
  },

  createOrUpdateInstitution(
    institution: InstitutionData
  ): Observable<InstitutionData> {
    return of([]);
  },

  getBankAccounts(): Observable<BankAccountData[]> {
    return of([]);
  },

  addBankAccount(bankAccount: BankAccountData) {
    return of([]);
  },

  getSettings(): Observable<SettingsData> {
    return of([]);
  },
  saveSettings(newSettings: SettingsData): Observable<SettingsData> {
    return of([]);
  }
};

export { SetupServiceStub };
