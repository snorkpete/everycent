import { Injectable } from '@angular/core';
import {ApiGateway} from "../../api/api-gateway.service";
import {BudgetData} from "./budget.model";
import {Observable} from "rxjs/Observable";

@Injectable()
export class BudgetService {

  constructor(
    private apiGateway: ApiGateway
  ) { }

  getBudgets(): Observable<BudgetData[]> {
    return this.apiGateway.get('/budgets');
  }
}
