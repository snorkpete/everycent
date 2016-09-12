import {Component, OnInit} from "@angular/core";
import {MenuDisplayService} from "../core/menu-display.service";
@Component({
  template: `
    <router-outlet></router-outlet>
  `
})
export class BudgetsComponent implements OnInit{

  constructor(
    private menuDisplay: MenuDisplayService
  ){}

  ngOnInit(): void {
    this.menuDisplay.setHeading('Budgets');
  }

}
