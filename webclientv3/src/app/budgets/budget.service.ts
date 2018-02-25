import { Injectable } from "@angular/core";
import { ApiGateway } from "../../api/api-gateway.service";
import { AllocationData } from "../transactions/allocation-data.model";
import {AllocationCategoryData} from "./allocation.model";
import { BudgetData } from "./budget.model";
import { Observable } from "rxjs/Observable";

@Injectable()
export class BudgetService {
  constructor(private apiGateway: ApiGateway) {}

  getBudgets(): Observable<BudgetData[]> {
    return this.apiGateway.get("/budgets");
  }

  getAllocations(budgetId: number): Observable<AllocationData[]> {
    return this.apiGateway.get("/allocations", {
      budget_id: budgetId
    });
  }

  getAllocationCategories(): Observable<AllocationCategoryData[]> {
    return this.apiGateway.get("/allocation_categories");
  }

  getBudget(budgetId: number) {
    return this.apiGateway.get(`/budgets/${budgetId}`);
  }

  getCurrentBudget() {
    return this.apiGateway.get('/budgets/current')
                .switchMap(budgetId => this.getBudget(budgetId));
  }

  createBudget(budget: BudgetData) {
    return this.apiGateway.post('/budgets', budget);
  }

  saveBudget(budget: BudgetData) {
    return this.apiGateway.put(`/budgets/${budget.id}`, budget);
  }

  copyBudget(budget: BudgetData) {
    return this.apiGateway.put(`/budgets/${budget.id}/copy`);
  }

  closeBudget(budget: BudgetData) {
    return this.apiGateway.put(`/budgets/${budget.id}/close`);
  }

  reopenLastBudget() {
    return this.apiGateway.put('/budgets/reopen_last_budget');
  }

}
