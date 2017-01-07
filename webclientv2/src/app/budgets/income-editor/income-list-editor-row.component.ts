import {Component, Input} from "@angular/core";
import {Income} from "../income.model";
import ColumnAlignments from "./income-list-align-values";
@Component({
  styles:[`
    div.deleted{
        background-color: mediumvioletred;
    }
  `],
  selector: 'ec-income-list-editor-row',
  template: `
    <div [class.deleted]="income.deleted" fxLayout="row" fxLayoutAlign="space-around">
      <md-input [readonly]="isViewMode" [value]="income.name" [fxFlex]="columnAlignments.name"></md-input>

      <ec-money-field [readonly]="isViewMode" [value]="income.amount" [fxFlex]="columnAlignments.amount"></ec-money-field>

      <select [value]="income.bank_account_id" [disabled]="isViewMode" [fxFlex]="columnAlignments.bankAccount">
          <option *ngFor="let bankAccount of bankAccounts" [value]="bankAccount.id">
             {{bankAccount.name}} 
          </option>
      </select>
      <md-input [readonly]="isViewMode" [value]="income.comment" [fxFlex]="columnAlignments.comment"></md-input>

      <ec-delete-button [item]="income" [fxFlex]="columnAlignments.action"></ec-delete-button>
    </div>
  `
})
export class IncomeListEditorRowComponent{
  @Input() income: Income;
  @Input() isViewMode: boolean;

  bankAccounts: any[];
  columnAlignments = ColumnAlignments;
}
