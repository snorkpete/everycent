import { ref } from 'vue';
import { defineStore } from 'pinia';
import { bankAccountApi } from './bankAccountApi';
import type { BankAccountData, InstitutionData } from './bankAccount.types';

export const useBankAccountStore = defineStore('bankAccounts', () => {
  const bankAccounts = ref<BankAccountData[]>([]);
  const institutions = ref<InstitutionData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      bankAccounts.value = await bankAccountApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load bank accounts';
    } finally {
      loading.value = false;
    }
  }

  async function fetchInstitutions() {
    try {
      institutions.value = await bankAccountApi.getInstitutions();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load institutions';
    }
  }

  async function save(account: BankAccountData) {
    loading.value = true;
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
    } finally {
      loading.value = false;
    }
  }

  return { bankAccounts, institutions, loading, error, fetchAll, fetchInstitutions, save };
});
