import { Component, OnInit } from '@angular/core';
import {MainToolbarService} from "../../shared/main-toolbar/main-toolbar.service";
import {AccountBalancesService} from "../account-balances.service";
import {BankAccountData} from "../bank-account.model";
import {MdSlideToggleChange} from "@angular/material";

@Component({
  selector: 'ec-account-balances',
  styles: [`
    .total {
      margin-right: 25px;
    }

    ec-account-list {
      margin-bottom: 5px;
    }
  `],
  template: `
    <div fxLayout="column">
      <md-slide-toggle fxFlexAlign="end end" [checked]="false" (change)="onIncludeClosedChanged($event)">Include Closed Accounts?</md-slide-toggle>
      <ec-account-list [bankAccounts]="currentAccounts" heading="Current Accounts"></ec-account-list>
      <ec-account-list [bankAccounts]="cashAssetAccounts" heading="Cash Assets"></ec-account-list>
      <ec-account-list [bankAccounts]="nonCashAssetAccounts" heading="Non Cash Assets"></ec-account-list>
      <div class="total" fxLayoutAlign="end">
        <h3>Total Assets: {{ totalAssets | ecMoney }}</h3>
      </div>
      <ec-account-list [bankAccounts]="creditCardAccounts" heading="Credit Cards"></ec-account-list>
      <ec-account-list [bankAccounts]="loanAccounts" heading="Loans"></ec-account-list>

      <ec-account-balance-totals [bankAccounts]="bankAccounts"></ec-account-balance-totals>
    </div>
  `
})
export class AccountBalancesComponent implements OnInit {
  bankAccounts: BankAccountData[] = [];

  assetAccounts: BankAccountData[];
  currentAccounts: BankAccountData[];
  nonCashAssetAccounts: BankAccountData[];

  loanAccounts: BankAccountData[];
  creditCardAccounts: BankAccountData[];
  liabilityAccounts: BankAccountData[];
  cashAssetAccounts: BankAccountData[];

  totalAssets = 0;
  searchParams = {};

  includeClosedAccounts = false;

  constructor(
    private toolbarService: MainToolbarService,
    private accountBalancesService: AccountBalancesService
  ) { }

  ngOnInit() {
    this.toolbarService.setHeading('Account Balances');
    this.refreshBankAccountList();
  }

  onIncludeClosedChanged(toggleEvent: MdSlideToggleChange) {
    this.includeClosedAccounts = toggleEvent.checked;
    this.refreshBankAccountList();
  }

  refreshBankAccountList(){
    this.accountBalancesService.getAccountBalances$(this.includeClosedAccounts).subscribe( bankAccounts => {
      this.bankAccounts = bankAccounts;
      this.updateBankAccountLists();
      this.totalAssets = this.accountBalancesService.totalAssets(this.bankAccounts);
    });
  }

  updateBankAccountLists() {
    this.currentAccounts = this.bankAccounts.filter( b => b.account_category == 'current');
    this.assetAccounts = this.bankAccounts.filter(b => b.account_category === 'asset');
    this.cashAssetAccounts = this.bankAccounts.filter(bankAccount => {
      return bankAccount.account_category === 'asset' && bankAccount.is_cash;
    });
    this.nonCashAssetAccounts = this.bankAccounts.filter(bankAccount => {
      return bankAccount.account_category === 'asset' && !bankAccount.is_cash;
    });
    this.liabilityAccounts = this.bankAccounts.filter(bankAccount => {
      return bankAccount.account_category === 'liability';
    });
    this.creditCardAccounts = this.bankAccounts.filter(bankAccount => {
      return bankAccount.account_category === 'liability' && bankAccount.is_cash;
    });
    this.loanAccounts = this.bankAccounts.filter(bankAccount => {
      return bankAccount.account_category === 'liability' && !bankAccount.is_cash;
    });
  }
}
