import {Component, OnInit} from "@angular/core";
import {MenuDisplayService} from "../core/menu-display.service";

@Component({
  template: `
    <h1>Account Balances</h1>
  `
})
export class AccountBalancesListComponent implements OnInit{

  constructor(
    private menuDisplayService: MenuDisplayService
  ){}

  ngOnInit(){
    this.menuDisplayService.setHeading('Account Balances');
  }

}
