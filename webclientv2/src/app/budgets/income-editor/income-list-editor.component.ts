import {Component, OnInit, Input} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

import total from '../../shared/item-total.function';
import ColumnAlignments from "./income-list-align-values";

@Component({
  styles:[`
    div.heading{
      font-weight: bold;
      size: 2em;
    }
    div.total{
      font-weight: bold;
      size: 3em;
    }
  `],
  selector: 'ec-income-list-editor',
  template: `
    <ec-card title="Incomes" type="primary">
       <div class="compact" *ngIf="budget?.incomes">
       <div class="heading" fxLayout="row">
          <div [fxFlex]="alignments.name">Name</div>
          <div [fxFlex]="alignments.amount" class="text-right">Amount</div>
          <div [fxFlex]="alignments.bankAccount">Bank Account</div>
          <div [fxFlex]="alignments.comment">Comment</div>
          <div [fxFlex]="alignments.action">&nbsp;</div>
       </div>
       <ec-income-list-editor-row 
           *ngFor="let income of budget.incomes"
           [income]="income"
           [isViewMode]="!(isEditMode$ | async)"
            >
       </ec-income-list-editor-row>
       <div class="total" fxLayout="row">
          <div [fxFlex]="alignments.name">Total</div>
          <div [fxFlex]="alignments.amount" class="text-right">{{ total(budget.incomes, 'amount') | ecToDollars }}</div>
          <div [fxFlex]="alignments.bankAccount"></div>
          <div [fxFlex]="alignments.comment"></div>
          <div [fxFlex]="alignments.action">&nbsp;</div>
       </div>
        </div>

        <div ec-card-actions *ngIf="isEditable()">
            
          <button md-raised-button color="primary" *ngIf="!(isEditMode$ | async)"
                  (click)="switchToEditMode()">
              Make Changes
          </button>
          
          <button md-raised-button color="accent" *ngIf="isEditMode$ | async"
                  (click)="addNewIncome()">
                    Add Income
          </button>
          
          <div align="end" *ngIf="isEditMode$ | async">
          
              <button md-raised-button color="accent"
                      (click)="switchToViewMode()">
                  Back to View Mode
              </button>
              
              <button md-raised-button color="warn"
                      (click)="cancelEdit()">
                  Cancel
              </button>
          </div>
        </div>
     </ec-card>
  `
})
export class IncomeListEditorComponent implements OnInit{

  @Input() budget: any = {};

  isEditMode$ = new BehaviorSubject<boolean>(false);
  isViewMode$: Observable<boolean>;
  total = total;
  alignments = ColumnAlignments;

  ngOnInit(): void {
    this.isViewMode$ = this.isEditMode$.map(mode => !mode);
  }

  isEditable(){
    return this.budget && this.budget.status == 'open';
  }

  switchToEditMode(){
    this.isEditMode$.next(true);
  }

  switchToViewMode(){
    this.isEditMode$.next(false);
  }

  cancelEdit(){
    this.isEditMode$.next(false);
  }

  markForDeletion(item, isDeleted){
    item.deleted = isDeleted;
  }

}