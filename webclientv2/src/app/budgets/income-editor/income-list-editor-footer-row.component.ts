import {Component, Input} from "@angular/core";
import {IncomeData} from "../income.model";
import ColumnAlignments from "./income-list-align-values";
import total from '../../shared/item-total.function';

@Component({
  selector: 'ec-income-list-editor-footer-row',
  styles:[`
    div.total{
        font-weight: bold;
        font-size: 1.1em;
    }
  `],
  template: `
     <div class="total" fxLayout="row" fxLayoutAlign="space-around" ecHideOnMobile>
        <div [fxFlex]="alignments.name">Total</div>
        <div [fxFlex]="alignments.amount" class="text-right">{{ total(incomes, 'amount') | ecToDollars }}</div>
        <div [fxFlex]="alignments.bankAccount"></div>
        <div [fxFlex]="alignments.comment"></div>
        <div [fxFlex]="alignments.action" *ngIf="isEditMode">&nbsp;</div>
     </div>
  `
})
export class IncomeListEditorFooterRowComponent{
  @Input() isEditMode: boolean;
  @Input() incomes: IncomeData[];
  alignments = ColumnAlignments;
  total = total;
}
