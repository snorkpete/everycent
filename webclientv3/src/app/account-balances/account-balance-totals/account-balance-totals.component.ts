import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BankAccountData} from "../bank-account.model";
import {AccountBalancesService} from "../account-balances.service";

@Component({
  selector: 'ec-account-balance-totals',
  styles: [`
    div.holder {
      margin: 30px;
    }
    span, ec-money-field {
      text-align: end;
    }

    hr {
      width: 100%;
    }
  `],
  template: `
    <div class="holder" fxLayout="column">

      <h3 fxLayout="row" fxLayoutAlign="end end">
        <span fxFlex="80">Total Liabilities</span>
        <ec-money-field fxFlex="20" [value]="abs.totalLiabilities(bankAccounts)"></ec-money-field>
      </h3>

      <hr/>

      <h3 class="net-worth" fxLayout="row" fxLayoutAlign="end center">
        <span fxFlex="80">Net Current Cash:</span>
        <ec-money-field fxFlex="20" [value]="abs.netCurrentCash(bankAccounts)"> </ec-money-field>
      </h3>

      <h3 class="net-worth text-right" fxLayout="row">
        <span fxFlex="80" fxFlexAlign="end">Net Cash Assets:</span>
        <ec-money-field fxFlex="20" [value]="abs.netCashAssets(bankAccounts)"> </ec-money-field>
      </h3>

      <h3 class="net-worth text-right" fxLayout="row" fxLayoutAlign="end center">
        <span fxFlex="80">Net Non Cash Assets:</span>
        <ec-money-field fxFlex="20" [value]="abs.netNonCashAssets(bankAccounts)"> </ec-money-field>
      </h3>

      <hr/>

      <h2 fxLayout="row">
        <span fxFlex="80">Net Worth:</span>
        <ec-money-field fxFlex="20" [value]="abs.netWorth(bankAccounts)"> </ec-money-field>
      </h2>
    </div>
  `,
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
