import {Component, Input, OnInit} from "@angular/core";
import ColumnAlignments from "./income-list-align-values";

@Component({
  selector: 'ec-income-list-editor-header-row',
  styles:[`
    div.heading{
      font-weight: bold;
      font-size: 1.2em;
    }
  `],
  template: `
     <div class="heading" fxLayout="row"
       fxLayoutAlign="space-around"  ecHideOnMobile>
       
        <div fxFlex.xs="1" [fxFlex]="alignments.name">Name</div>
        <div fxFlex.xs="1" [fxFlex]="alignments.amount" class="text-right">Amount</div>
        <div fxFlex.xs="1" [fxFlex]="alignments.bankAccount">Bank Account</div>
        <div fxFlex.xs="1" [fxFlex]="alignments.comment">Comment</div>
        <div fxFlex.xs="1" [fxFlex]="alignments.action" *ngIf="isEditMode">&nbsp;</div>
     </div>
  `
})
export class IncomeListEditorHeaderRowComponent implements OnInit{
  @Input() isEditMode: boolean;
  alignments = ColumnAlignments;

  ngOnInit(): void {

  }
}
