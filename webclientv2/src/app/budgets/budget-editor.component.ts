import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {BudgetService} from "./budget.service";
import {MenuDisplayService} from "../core/menu-display.service";
@Component({
  template: `
    <h1>Budget: {{ budgetName$ | async }} <small>Setup Budget</small></h1> 
    
    <div align="end">
        <button md-raised-button routerLink="/budgets"> Back to Budget List</button>
        <button md-raised-button [routerLink]="'/transactions?budget='+budget?.id">View Transactions</button>
    </div>

    <ec-income-list-editor [budget]="budget"></ec-income-list-editor>
    <!--
    <ec-allocation-list-editor budget="vm.budget"></ec-allocation-list-editor>
    -->

    <div *ngIf="budget?.status=='open'">
        <button md-raised-button color="accent"
                (click)="saveChanges(budget)">
            Save Changes
        </button>
        
        <button md-raised-button color="warn"
                (click)="cancelEdit()">
            Cancel
        </button>
    </div>
  `
})
export class BudgetEditorComponent implements OnInit{
  budgetId$: Observable<any>;
  budget$: Observable<any>;
  budgetName$: Observable<string>;
  budget: any;

  constructor(
    private menuDisplay: MenuDisplayService,
    private budgetService: BudgetService,
    private activatedRoute: ActivatedRoute
  ){}

  ngOnInit(){
    this.budgetId$ = this.activatedRoute.params.map(p => p['id']);
    this.budget$ = this.budgetId$
                       .switchMap( id=> this.budgetService.getBudget(id))
                       .share();
    this.budgetName$ = this.budget$
                           .do(b => this.budget = b)  // extract the budget for use elsewhere TODO: may not be necessary
                           .map(b => b.name)
                           .do(name => this.menuDisplay.setHeading(`Edit Budget: ${name}`))
  }
}
