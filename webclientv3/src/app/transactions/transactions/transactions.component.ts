import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ec-transactions',
  styles: [`
    mat-card, mat-card-content, .container {
      height: 100%;
    }
  `],
  template: `
    <mat-card>
      <mat-card-content>
        <div fxLayout="column" class="container">
          <div class="header" fxLayout="row" fxLayoutGap="20px" fxFlex="1 0 auto">
            <ec-transaction-search-form fxFlex></ec-transaction-search-form>
            <ec-transaction-summary fxFlex></ec-transaction-summary>
          </div>
          <div fxFlex="2 0 auto">
            Transaction List
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `
})
export class TransactionsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
