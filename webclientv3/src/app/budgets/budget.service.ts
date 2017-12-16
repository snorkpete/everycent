import { Injectable } from "@angular/core";
import { ApiGateway } from "../../api/api-gateway.service";
import { AllocationData } from "../transactions/allocation-data.model";
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
}
