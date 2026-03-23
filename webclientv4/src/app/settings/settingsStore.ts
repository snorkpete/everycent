import { ref } from 'vue';
import { defineStore } from 'pinia';
import { settingsApi } from './settingsApi';
import { allocationCategoryApi } from '../allocation-categories/allocationCategoryApi';
import apiGateway from '../../api/api-gateway';
import type { SettingsData } from './settings.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<SettingsData>({});
  const bankAccounts = ref<BankAccountData[]>([]);
  const allocationCategories = ref<AllocationCategoryData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const [loadedSettings, loadedAccounts, loadedCategories] = await Promise.all([
        settingsApi.get(),
        // Fetch directly to avoid coupling with bankAccountStore's loading state
        apiGateway.get<BankAccountData[]>('/bank_accounts').then((r) => r.data),
        allocationCategoryApi.getAll(),
      ]);
      settings.value = loadedSettings;
      bankAccounts.value = loadedAccounts;
      allocationCategories.value = loadedCategories;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load settings';
    } finally {
      loading.value = false;
    }
  }

  async function save(newSettings: SettingsData) {
    loading.value = true;
    error.value = null;
    try {
      settings.value = await settingsApi.save(newSettings);
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save settings';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return { settings, bankAccounts, allocationCategories, loading, error, fetchAll, save };
});
