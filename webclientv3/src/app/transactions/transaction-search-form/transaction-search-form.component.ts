import { Component, OnInit } from '@angular/core';
import {BankAccountData} from "../../account-balances/bank-account.model";

@Component({
  selector: 'ec-transaction-search-form',
  styles: [`
  `],
  template: `
    <form (ngSubmit)="onSubmit()">
    <mat-card>

      <mat-card-title>Select Transactions to View</mat-card-title>
      <mat-card-content>
        
        <div fxLayout="column" fxLayoutGap="20px">
        
          <mat-form-field placeholder="Bank Account" fxFlex>
            <mat-select>
              <mat-option *ngFor="let bankAccount of bankAccounts">{{bankAccount.name}}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field placeholder="Budget" fxFlex>
            <mat-select>
              <mat-option *ngFor="let budget of budgets">{{budget.name}}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        
      </mat-card-content>
    
      <mat-card-actions>
        <button mat-button type="submit" color="primary">Refresh</button>
      </mat-card-actions>
    </mat-card>
    </form>
  `
})
export class TransactionSearchFormComponent implements OnInit {

  bankAccounts: BankAccountData[] = [];

  constructor() { }

  ngOnInit() {
  }

}
