import {Component, Input} from "@angular/core";
import {IncomeData} from "../income.model";
import ColumnAlignments from "./income-list-align-values";
@Component({
  styles:[`
    div.deleted{
        background-color: mediumvioletred;
        padding: 5px;
        border: 2px solid grey;
        border-radius: 5px; 
        margin-bottom: 3px;
        color: white;
    }
    
    div.row{
        border-bottom: 2px solid darkgrey; 
    }
  `],
  selector: 'ec-income-list-editor-row',
  template: `
    <div class="row" [class.deleted]="income.deleted" 
    fxLayout="row" fxLayoutAlign="space-around"
    >
      <md-input [readonly]="isViewMode" [value]="income.name" [fxFlex]="columnAlignments.name"></md-input>

      <ec-money-field [readonly]="isViewMode" [value]="income.amount" [fxFlex]="columnAlignments.amount"></ec-money-field>

      <select ecHideOnMobile 
              [value]="income.bank_account_id" 
              [disabled]="isViewMode" [fxFlex]="columnAlignments.bankAccount">
          <option *ngFor="let bankAccount of bankAccounts" [value]="bankAccount.id">
             {{bankAccount.name}} 
          </option>
      </select>
      <md-input ecHideOnMobile
      [readonly]="isViewMode" [value]="income.comment" [fxFlex]="columnAlignments.comment"></md-input>

      <ec-delete-button *ngIf="!isViewMode" [item]="income" [fxFlex]="columnAlignments.action"></ec-delete-button>
    </div>
  `
})
export class IncomeListEditorRowComponent{
  @Input() income: IncomeData;
  @Input() isViewMode: boolean;

  bankAccounts: any[];
  columnAlignments = ColumnAlignments;
}
