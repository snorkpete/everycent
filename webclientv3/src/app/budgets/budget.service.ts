import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiGateway } from "../../api/api-gateway.service";
import { AllocationData } from "../transactions/allocation-data.model";
import { AllocationCategoryData } from "./allocation.model";
import { BudgetData } from "./budget.model";

@Injectable()
export class BudgetService {
  constructor(private apiGateway: ApiGateway) {}

  getBudgets(): Observable<BudgetData[]> {
    return this.apiGateway.get("/budgets");
  }

  getBudgetsWithTransactions(): Observable<BudgetData[]> {
    return this.getBudgets().pipe(
      map(budgets => {
        const openBudgets = budgets.filter(b => b.status === "open");
        const closedBudgets = budgets.filter(b => b.status === "closed");
        const currentBudget = openBudgets[openBudgets.length - 1];

        // if we have an open budget, add it to the list
        if (currentBudget) {
          closedBudgets.unshift(currentBudget);
        }
        return closedBudgets;
      })
    );
  }
  getFutureBudgets(): Observable<BudgetData[]> {
    return this.apiGateway.get("/budgets/future");
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

  getCurrentBudgetId() {
    return this.apiGateway
      .get("/budgets/current")
      .pipe(map(data => data.budget_id));
    // .switchMap(budgetId => this.getBudget(budgetId));
  }

  createBudget(budget: BudgetData) {
    return this.apiGateway.post("/budgets", budget);
  }

  addBudget(budget: BudgetData) {
    return this.apiGateway.post("/budgets", budget);
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
    return this.apiGateway.post("/budgets/reopen_last_budget");
  }
}
