import { ref } from 'vue';
import { defineStore } from 'pinia';
import { settingsApi } from './settingsApi';
import { bankAccountApi } from '../bank-accounts/bankAccountApi';
import { allocationCategoryApi } from '../allocation-categories/allocationCategoryApi';
import type { SettingsData } from './settings.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<SettingsData>({});
  const bankAccounts = ref<BankAccountData[]>([]);
  const allocationCategories = ref<AllocationCategoryData[]>([]);
  const error = ref<string | null>(null);

  async function fetchAll() {
    error.value = null;
    try {
      const [loadedSettings, loadedAccounts, loadedCategories] = await Promise.all([
        settingsApi.get(),
        bankAccountApi.getOpen(),
        allocationCategoryApi.getAll(),
      ]);
      settings.value = loadedSettings;
      bankAccounts.value = loadedAccounts;
      allocationCategories.value = loadedCategories;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load settings';
    }
  }

  async function save(newSettings: SettingsData) {
    error.value = null;
    try {
      settings.value = await settingsApi.save(newSettings);
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save settings';
      throw e;
    }
  }

  return { settings, bankAccounts, allocationCategories, error, fetchAll, save };
});
