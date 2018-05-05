import { Observable } from "rxjs/Observable";
import { BankAccountData } from "../../src/app/bank-accounts/bank-account.model";
import { InstitutionData } from "../../src/app/bank-accounts/institution.model";
import { SettingsData } from "../../src/app/shared/settings-data.model";

const SetupServiceStub = {
  getInstitutions(): Observable<InstitutionData[]> {
    return Observable.of([]);
  },

  addInstitution(institution: InstitutionData): Observable<InstitutionData> {
    return Observable.of([]);
  },

  saveInstitution(institution: InstitutionData): Observable<InstitutionData> {
    return Observable.of([]);
  },

  createOrUpdateInstitution(
    institution: InstitutionData
  ): Observable<InstitutionData> {
    return Observable.of([]);
  },

  getBankAccounts(): Observable<BankAccountData[]> {
    return Observable.of([]);
  },

  addBankAccount(bankAccount: BankAccountData) {
    return Observable.of([]);
  },

  getSettings(): Observable<SettingsData> {
    return Observable.of([]);
  },
  saveSettings(newSettings: SettingsData): Observable<SettingsData> {
    return Observable.of([]);
  }
};

export { SetupServiceStub };
