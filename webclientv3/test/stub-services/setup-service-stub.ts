import { Observable, of } from "rxjs";
import { BankAccountData } from "../../src/app/bank-accounts/bank-account.model";
import { InstitutionData } from "../../src/app/bank-accounts/institution.model";
import { AllocationCategoryData } from "../../src/app/budgets/allocation.model";
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

  getAllBankAccounts(): Observable<BankAccountData[]> {
    return of([]);
  },

  addBankAccount(bankAccount: BankAccountData) {
    return of([]);
  },

  getAllocationCategories(): Observable<AllocationCategoryData[]> {
    return of([]);
  },

  addAllocationCategory(allocationCategory: AllocationCategoryData) {
    return of([]);
  },

  saveAllocationCategory(
    allocationCategory: AllocationCategoryData
  ): Observable<AllocationCategoryData> {
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
