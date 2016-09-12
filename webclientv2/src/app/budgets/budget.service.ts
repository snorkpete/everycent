import {Injectable} from "@angular/core";
import {ApiGateway} from "../core/api-gateway.service";
@Injectable()
export class BudgetService{

  constructor(
    private apiGateway: ApiGateway
  ){}

  getBudgets(){
    return this.apiGateway.get('/budgets');
  }

  getBudget(id){
    return this.apiGateway.get(`/budgets/${id}`);
  }
}
