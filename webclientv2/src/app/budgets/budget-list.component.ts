import {Component, OnInit} from "@angular/core";
import {BudgetService} from "./budget.service";
import {Icons} from '../shared/icons.constants';
import {Router} from "@angular/router";

@Component({
  template: `
    <ec-card title="Budgets">
        <table class="table table-bordered clear-background rounded">
        <thead>
            <tr class="heading">
                <th>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr *ngFor="let budget of (budgets | async); let mostRecent=first;">
                <td> {{ budget.name }} </td>
                <td> {{ budget.start_date }} </td>
                <td> {{ budget.end_date }} </td>
                <td>
                    <button md-raised-button color="primary" (click)="copyBudget(budget)"
                          *ngIf="mostRecent">
                        <md-icon>{{Icons.COPY}} </md-icon>
                        Copy
                    </button>
                    
                    <button md-raised-button color="warn" (click)="closeBudget(budget)"
                          *ngIf="budget.status=='open'">
                        <md-icon>{{Icons.CLOSE}}</md-icon>
                        Close
                    </button>
                    
                    <button md-raised-button color="accent" (click)="viewBudget(budget)">
                        <md-icon>{{Icons.EDIT}}</md-icon>
                        View
                    </button>
                    
                </td>

            </tr>
        </tbody>
        </table>
        <md-card-actions *ngIf="false">
            <button md-raised-button color="primary"
                    ng-click="vm.state.goToState('budgets.new')">
                Create New Budget
            </button>
        
            <button md-raised-button color="primary"
                    ng-click="vm.state.goToState('budgets')">
                Cancel
            </button>
            <button md-raised-button color="primary"
                    ng-click="vm.reopenLastBudget()">
                Reopen Last Budget
            </button>
        </md-card-actions>
    </ec-card>

  <!--
    <div class="row">
        <div class="col-xs-2" ng-show="vm.state.is('budgets')">
            <button class="btn btn-primary"
                    ng-click="vm.state.goToState('budgets.new')">
                Create New Budget
            </button>
        </div>
        <div class="col-xs-2" ng-show="vm.state.is('budgets.new')">
            <button class="btn btn-default"
                    ng-click="vm.state.goToState('budgets')">
                Cancel
            </button>
        </div>
        <div class="col-xs-2" ng-show="vm.state.is('budgets.new')">
            <button class="btn btn-warning"
                    ng-click="vm.reopenLastBudget()">
                Reopen Last Budget
            </button>
        </div>
    </div>
    -->
  `
})
export class BudgetListComponent implements OnInit{
  public budgets; //: Array<any>;
  public Icons = Icons;

  constructor(
    private budgetService: BudgetService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.budgets = this.budgetService.getBudgets();
  }

  viewBudget(budget){
    this.router.navigateByUrl(`/budgets/edit/${budget.id}`);
  }

}