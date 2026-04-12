import apiGateway from '../../../api/api-gateway';
import type { FutureBudgetData, MassUpdatePayload } from './futureBudgets.types';

export const futureBudgetsApi = {
  getFutureBudgets: () => apiGateway.get<FutureBudgetData[]>('/budgets/future').then((r) => r.data),

  massUpdate: (payload: MassUpdatePayload) =>
    apiGateway.post<{ success: boolean }>('/budgets/mass_update', payload).then((r) => r.data),
};
