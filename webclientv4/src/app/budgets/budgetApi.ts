import apiGateway from '../../api/api-gateway';
import type { BudgetData } from './budget.types';
import type { AllocationData } from '../transactions/transaction.types';

export const budgetApi = {
  getAll: () =>
    apiGateway.get<BudgetData[]>('/budgets').then((r) => r.data),

  getAllocations: (budgetId: number) =>
    apiGateway
      .get<AllocationData[]>('/allocations', { params: { budget_id: budgetId } })
      .then((r) => r.data),
};
