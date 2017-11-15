import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BankAccountData} from "../bank-account.model";
import {AccountBalancesService} from "../account-balances.service";

@Component({
  selector: 'ec-account-balance-totals',
  template: `
    <div class="row">
      <div class="col-xs-12">
        <h4 class="net-worth text-right">
          Total Liabilities: &nbsp; <ec-money-field [value]="abs.totalLiabilities(bankAccounts)">
        </ec-money-field>
        </h4>
      </div>
    </div>
    <br/>
    <hr>
    <div class="row">
      <div class="col-xs-12">
        <h4 class="net-worth text-right">
          Net Current Cash: &nbsp; <ec-money-field [value]="abs.netCurrentCash(bankAccounts)">
        </ec-money-field>
        </h4>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12">
        <h4 class="net-worth text-right">
          Net Cash Assets: &nbsp; <ec-money-field [value]="abs.netCashAssets(bankAccounts)">
        </ec-money-field>
        </h4>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12">
        <h4 class="net-worth text-right">
          Net Non Cash Assets: &nbsp; <ec-money-field [value]="abs.netNonCashAssets(bankAccounts)">
        </ec-money-field>
        </h4>
      </div>
    </div>
    <hr>
    <div class="row">
      <div class="col-xs-12">
        <h3 class="net-worth text-right">
          Net Worth: &nbsp; <ec-money-field [value]="abs.netWorth(bankAccounts)">
        </ec-money-field>
        </h3>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountBalanceTotalsComponent implements OnInit, OnChanges {

  @Input() bankAccounts: BankAccountData[] = [];

  totalAssets = 0;
  totalLiabilities = 0;
  netCurrentCash = 0;
  netCashAssets  = 0;
  netNonCashAssets = 0;
  netWorth = 0;

  constructor(
    public abs: AccountBalancesService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateTotals();
  }

  updateTotals() {
    this.totalAssets = this.abs.totalAssets(this.bankAccounts);
    this.totalLiabilities = this.abs.totalLiabilities(this.bankAccounts);
    this.netCurrentCash = this.abs.netCurrentCash(this.bankAccounts);
    this.netCashAssets  = this.abs.netCashAssets(this.bankAccounts);
    this.netNonCashAssets = this.abs.netNonCashAssets(this.bankAccounts);
    this.netWorth = this.abs.netWorth(this.bankAccounts);

  }

}
