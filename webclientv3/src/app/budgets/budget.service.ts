import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiGateway } from "../../api/api-gateway.service";
import { AllocationCategoryData, AllocationData } from "./allocation.model";
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
  }

  createBudget(budget: BudgetData) {
    return this.apiGateway.post("/budgets", budget);
  }

  addBudget(budget: BudgetData) {
    return this.apiGateway.post("/budgets", budget);
  }

  saveBudget(budget: BudgetData) {
    // 'dummyTransactions' are an implementation detail of the budget data table
    // the API shouldn't have to care about this
    budget.allocations = budget.allocations.filter(
      allocation => !allocation.dummyTransaction
    );
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

  massSave(massEditData) {
    return this.apiGateway.post(`/budgets/mass_update`, massEditData);
  }

  findCategoryNameFromId(categoryId, allocationCategories) {
    let found = allocationCategories.find(cat => cat.id === categoryId);
    if (!found) {
      return "";
    } else {
      return found.name;
    }
  }

  sortBudgetAllocationsAndAssignCategoryNames(
    budget: BudgetData,
    allocationCategories: AllocationCategoryData[]
  ) {
    const newAllocationList = [];

    allocationCategories.forEach(category => {
      const categoryRow: AllocationData = {
        name: "",
        allocationCategory: category.name,
        allocation_category_id: category.id,
        dummyTransaction: true,
        isCategoryHeaderRow: true
      };

      const addAllocationRow: AllocationData = {
        name: "",
        allocationCategory: category.name,
        allocation_category_id: category.id,
        dummyTransaction: true,
        isAllocationButtonRow: true
      };

      const allocationsForCategory = budget.allocations
        .filter(allocation => allocation.allocation_category_id === category.id)
        .sort((a, b) => a.name.localeCompare(b.name));

      newAllocationList.push(categoryRow);
      newAllocationList.push(...allocationsForCategory);
      newAllocationList.push(addAllocationRow);
    });

    budget.allocations = newAllocationList;
  }
}
