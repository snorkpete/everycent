import apiGateway from '../../../api/api-gateway';
import type { AllocationCategoryData } from '../../allocation-categories/allocationCategory.types';
import type { SettingsData } from '../../settings/settings.types';
import type { FutureBudgetData, MassUpdatePayload } from './futureBudgets.types';

export const futureBudgetsApi = {
  getFutureBudgets: () => apiGateway.get<FutureBudgetData[]>('/budgets/future').then((r) => r.data),

  getAllocationCategories: () =>
    apiGateway.get<AllocationCategoryData[]>('/allocation_categories').then((r) => r.data),

  getSettings: () => apiGateway.get<SettingsData>('/settings').then((r) => r.data),

  massUpdate: (payload: MassUpdatePayload) =>
    apiGateway.post<{ success: boolean }>('/budgets/mass_update', payload).then((r) => r.data),
};
