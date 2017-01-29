import {Component, OnInit, ViewChild} from "@angular/core";
import {MenuDisplayService} from "../core/menu-display.service";
import {AccountBalancesService} from "./account-balances.service";
import {FormControl} from "@angular/forms";
import {AgGridNg2} from "ag-grid-ng2";

@Component({
  template: `
    <div align="end">
      <md-checkbox [formControl]="includeClosedControl">
          Include Closed Accounts?
      </md-checkbox>
    </div>
    
    <ec-account-balance-list title="Current Accounts" [bankAccounts]="currentAccounts">
    </ec-account-balance-list>
        
    <ec-account-balance-list title="Current Accounts" [bankAccounts]="assetAccounts">
    </ec-account-balance-list>
    
    <ec-account-balance-list title="Liability Accounts" [bankAccounts]="liabilityAccounts">
    </ec-account-balance-list>
    
    <ec-card>
        <h3 align="end">Net Worth: <ec-amount-formatted [amount]="netWorth"></ec-amount-formatted> </h3>
    </ec-card>
    
    
  <button (click)="autoResize()"> Resize</button>
   <ag-grid-ng2 #agGrid style="width: 100%; height: 450px;" class="ag-material" (gridSizeChanged)="autoResize()"

      [columnDefs]="columnDefs"
      [rowData]="currentAccounts"

      rowHeight="42"
      rowSelection="single"
      >

  </ag-grid-ng2> 
  `
})
export class AccountBalancesComponent implements OnInit{

  columnDefs = [
    { headerName: 'Name', field: 'name' },
    { headerName: 'Institution', field: 'name' },
    { headerName: 'Account Type', field: 'account_type' },
    { headerName: 'Category', field: 'account_category' },
    { headerName: 'Balance At Start', field: 'closing_balance' },
    { headerName: 'Balance At Close', field: 'expected_closing_balance' },
    { headerName: 'Current Balance', field: 'current_balance' },
  ];

  bankAccounts = [];
  netWorth: number;
  currentAccounts = [];
  assetAccounts = [];
  liabilityAccounts = [];

  includeClosedControl = new FormControl(false);

  @ViewChild('agGrid')
  grid: AgGridNg2;

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

        this.netWorth = this.accountBalancesService.netWorth(bankAccounts);

        this.grid.api.sizeColumnsToFit();
    });

  }

  autoResize(){
    console.log('resize');
    if(!this.grid.api){
      return;
    }
    this.grid.api.sizeColumnsToFit();
  }
}
