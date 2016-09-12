import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {BudgetService} from "./budget.service";
import {MenuDisplayService} from "../core/menu-display.service";
@Component({
  template: `
    <h3>Edit Budget {{ budgetName$ | async }}</h3> 
    
    
  `
})
export class BudgetEditorComponent implements OnInit{
  budgetId$: Observable<any>;
  budget$: Observable<any>;
  budgetName$: Observable<string>;

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
                           .map(b => b.name)
                           .do(name => this.menuDisplay.setHeading(`Edit Budget: ${name}`))
  }
}
