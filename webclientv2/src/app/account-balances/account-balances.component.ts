import {Component, OnInit} from "@angular/core";
import {MenuDisplayService} from "../core/menu-display.service";
import {AccountBalancesService} from "./account-balances.service";
import {FormControl} from "@angular/forms";

@Component({
  template: `
    <div align="end">
      <md-checkbox [formControl]="includeClosedControl">
          Include Closed Accounts?
      </md-checkbox>
    </div>
        <!--
    <div
    <md-checkbox
       (click)="setupAccountCategories()"
        [(ngModel)]="includeClosed"
    >
        Include Closed Accounts?
    </md-checkbox>
        <div class="col-xs-6">
            <div class="text-right">
                    <label>
                        <input type="checkbox"
                               ng-click="vm.refresh()"
                               ng-model="vm.searchParams.include_closed" />
                        Include Closed Accounts?
                    </label>
            </div>
        </div>
        -->
    <ec-account-balance-list title="Current Accounts" [bankAccounts]="currentAccounts">
    </ec-account-balance-list>
        
    <ec-account-balance-list title="Current Accounts" [bankAccounts]="assetAccounts">
    </ec-account-balance-list>
    
    <ec-account-balance-list title="Liability Accounts" [bankAccounts]="liabilityAccounts">
    </ec-account-balance-list>
    
    <ec-card>
        <h3>Net Worth: </h3>
    </ec-card>
    <!--
    <div class="row">
        <div class="col-xs-12">
           <h3 class="net-worth text-right">
                Net Worth: &nbsp; <ec-amount-formatted amount="vm.netWorth(vm.bankAccounts)">
                           </ec-amount-formatted>
           </h3>
        </div>
    </div>
    -->
  `
})
export class AccountBalancesComponent implements OnInit{

  bankAccounts = [];
  currentAccounts = [];
  assetAccounts = [];
  liabilityAccounts = [];

  includeClosedControl = new FormControl(false);

  constructor(
    private menuDisplayService: MenuDisplayService,
    private accountBalancesService: AccountBalancesService
  ){}

  ngOnInit(){
    this.menuDisplayService.setHeading('Account Balances');
    this.includeClosedControl
        .valueChanges
        .subscribe(includeClosed => this.setupAccountCategories(includeClosed));

    this.setupAccountCategories();

  }

  setupAccountCategories(include_closed?: boolean){

    this.accountBalancesService
      .getAccountBalances({include_closed})
      .subscribe(bankAccounts => {

        this.bankAccounts = bankAccounts;
        this.currentAccounts = this.bankAccounts.filter( b => b.account_category == 'current');
        this.assetAccounts = this.bankAccounts.filter( b => b.account_category == 'asset');
        this.liabilityAccounts = this.bankAccounts.filter( b => b.account_category == 'liability');
    });

  }

}
