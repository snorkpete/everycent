import { ref } from 'vue';
import { defineStore } from 'pinia';
import { bankAccountApi } from './bankAccountApi';
import { institutionApi } from '../institutions/institutionApi';
import type { BankAccountData } from './bankAccount.types';
import type { InstitutionData } from '../institutions/institution.types';

export const useBankAccountStore = defineStore('bankAccounts', () => {
  const bankAccounts = ref<BankAccountData[]>([]);
  const institutions = ref<InstitutionData[]>([]);
  const error = ref<string | null>(null);

  async function fetchAll() {
    error.value = null;
    try {
      const accounts = await bankAccountApi.getAll();
      accounts.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
      bankAccounts.value = accounts;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load bank accounts';
    }
  }

  async function fetchInstitutions() {
    error.value = null;
    try {
      institutions.value = await institutionApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load institutions';
    }
  }

  async function save(account: BankAccountData) {
    error.value = null;
    try {
      if (account.id) {
        await bankAccountApi.update(account as BankAccountData & { id: number });
      } else {
        await bankAccountApi.create(account);
      }
      await fetchAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save bank account';
      throw e;
    }
  }

  return { bankAccounts, institutions, error, fetchAll, fetchInstitutions, save };
});
