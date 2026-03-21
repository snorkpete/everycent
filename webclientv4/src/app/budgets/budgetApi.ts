import apiGateway from '../../api/api-gateway';
import type { BudgetData, BudgetDetailData, IncomeData } from './budget.types';
import type { AllocationData } from '../transactions/transaction.types';

export const budgetApi = {
  getAll: () =>
    apiGateway.get<BudgetData[]>('/budgets').then((r) => r.data),

  get: (id: number) =>
    apiGateway
      .get<{ budget: BudgetDetailData }>(`/budgets/${id}`)
      .then((r) => r.data.budget),

  getAllocations: (budgetId: number) =>
    apiGateway
      .get<AllocationData[]>('/allocations', { params: { budget_id: budgetId } })
      .then((r) => r.data),

  getCurrentBudgetId: () =>
    apiGateway
      .get<{ budget_id: number }>('/budgets/current')
      .then((r) => r.data.budget_id),

  create: (budget: { start_date: string }) =>
    apiGateway.post<BudgetData>('/budgets', budget).then((r) => r.data),

  copy: (budgetId: number) =>
    apiGateway.put<void>(`/budgets/${budgetId}/copy`).then((r) => r.data),

  close: (budgetId: number) =>
    apiGateway.put<void>(`/budgets/${budgetId}/close`).then((r) => r.data),

  reopenLast: () =>
    apiGateway.post<void>('/budgets/reopen_last_budget').then((r) => r.data),

  save: (budget: BudgetDetailData) =>
    apiGateway
      .put<{ budget: BudgetDetailData }>(`/budgets/${budget.id}`, {
        incomes: budget.incomes as IncomeData[],
        allocations: budget.allocations as AllocationData[],
      })
      .then((r) => r.data.budget),
};
