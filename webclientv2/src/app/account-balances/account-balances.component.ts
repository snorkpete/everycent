import {Component, OnInit} from "@angular/core";
import {MenuDisplayService} from "../core/menu-display.service";
import {AccountBalancesService} from "./account-balances.service";

@Component({
  template: `
    <h1>Account Balances</h1>
    <pre> current: {{ currentAccounts | json}}</pre>
    <pre> asset: {{ assetAccounts | json}}</pre>
    <pre> liabi: {{ liabilityAccounts | json}}</pre>
  `
})
export class AccountBalancesComponent implements OnInit{

  bankAccounts = [];
  currentAccounts = [];
  assetAccounts = [];
  liabilityAccounts = [];

  constructor(
    private menuDisplayService: MenuDisplayService,
    private accountBalancesService: AccountBalancesService
  ){}

  ngOnInit(){
    this.menuDisplayService.setHeading('Account Balances');
    this.setupAccountCategories();

  }

  setupAccountCategories(){
    this.accountBalancesService
      .getAccountBalances({})
      .subscribe(bankAccounts => {

        this.bankAccounts = bankAccounts;
        this.currentAccounts = this.bankAccounts.filter( b => b.account_category == 'current');
        this.assetAccounts = this.bankAccounts.filter( b => b.account_category == 'asset');
        this.liabilityAccounts = this.bankAccounts.filter( b => b.account_category == 'liability');
    });

  }

}
