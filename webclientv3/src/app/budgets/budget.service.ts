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
    allocations: AllocationData[],
    allocationCategories: AllocationCategoryData[]
  ) {
    if (!allocations) {
      return;
    }

    // ensure that if we don't have any existing allocations for a category,
    // that we create a 'dummy allocation' that will still allow the category
    // to be in the list of allocations
    allocationCategories.forEach(category => {
      let found = allocations.find(
        allocation => category.id === allocation.allocation_category_id
      );

      if (!found) {
        allocations.push({
          name: "",
          allocation_category_id: category.id,
          dummyTransaction: true
        });
      }
    });

    allocations.sort((a, b) => {
      let sortValue = 0;

      let aCategoryName = this.findCategoryNameFromId(
        a.allocation_category_id,
        allocationCategories
      );
      let bCategoryName = this.findCategoryNameFromId(
        b.allocation_category_id,
        allocationCategories
      );

      // ensure that the allocations also contain the category names
      // Yes, this is not the best use case for sorting - we should not be mutating
      // the objects in the array while sorting them.
      // However, doing this prevents us from having to iterate the array a second time
      // to add the allocation names
      a.allocationCategory = aCategoryName;
      b.allocationCategory = bCategoryName;

      if (aCategoryName < bCategoryName) {
        sortValue = -10;
      } else if (aCategoryName > bCategoryName) {
        sortValue = 10;
      } else {
        sortValue = 0;
      }

      if (a.name < b.name) {
        sortValue -= 1;
      } else if (a.name > b.name) {
        sortValue += 1;
      }

      return sortValue;
    });

    // going to cheat a bit with reduce - we dont actually want to reduce to a single value
    // However, reduce gives you an easy way to compare adjacent elements in the array to each other
    // to determine when the category changes
    allocations.reduce((acc, current) => {
      if (acc.allocation_category_id !== current.allocation_category_id) {
        acc.lastInCategory = true;
        current.firstInCategory = true;
      } else {
        acc.lastInCategory = false;
        current.firstInCategory = false;
      }

      return current;
    });

    // the first element is always first
    if (allocations.length > 0) {
      allocations[0].firstInCategory = true;
    }
  }
}
