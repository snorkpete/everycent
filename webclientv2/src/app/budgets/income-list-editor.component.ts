import {Component, OnInit, Input} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

import total from '../shared/item-total.function';

@Component({
  styles:[`
    md-card-actions div[align="end"]{
       margin-right: 16px; 
    }
  `],
  selector: 'ec-income-list-editor',
  template: `
    <ec-card title="Incomes" type="primary">
       <table class="table compact" *ngIf="budget?.incomes">
       <thead>
          <tr class="heading">
            <th style="width:25%;">Name</th>
            <th style="width:15%;" class="text-right">Amount</th>
            <th style="width:15%;">Bank Account</th>
            <th style="width:40%;">Comment</th>
            <th style="width:5%;"></th>
          </tr>
        </thead>
        <tbody>
            <tr *ngFor="let income of budget.incomes" [class.danger]="income.deleted">
                <td>
                    <md-input [readonly]="isViewMode$ | async" [value]="income.name"></md-input>
                </td>

                <td class="text-right">
                    <md-input [readonly]="isViewMode$ | async" [value]="income.amount" ec-as-dollars></md-input>
                </td>

                <td>
                    <select [value]="income.bank_account_id" [disabled]="isViewMode$ | async">
                        <option *ngFor="let bankAccount of bankAccounts" [value]="bankAccount.id">
                           {{bankAccount.name}} 
                        </option>
                    </select>
                    <!--
                    <select ng-show="vm.isEditMode"
                            ng-model="income.bank_account"
                            ng-change="vm.ref.updateReferenceId(income, 'bank_account')"
                            ng-options="bankAccount.name for bankAccount in vm.bankAccounts track by bankAccount.id">
                    </select>
                    <span ng-hide="vm.isEditMode" ng-bind="income.bank_account.name"></span>
                    -->
                </td>

                <td>
                    <md-input [readonly]="isViewMode$ | async" [value]="income.comment"></md-input>
                </td>

                <!-- actions -->
                <td>
                    <button md-icon-button (click)="markForDeletion(income, true)" *ngIf="!income.deleted">
                        <md-icon>trash</md-icon>
                    </button>
                    
                    <button md-icon-button (click)="markForDeletion(income, false)" *ngIf="income.deleted">
                        <md-icon>refresh</md-icon>
                    </button>
                </td>

            </tr>
        </tbody>
        <tfoot>
            <tr class="total">
                <th>Total</th>
                <th class="text-right">{{ total(budget.incomes, 'amount') | ecToDollars }}</th>
                <th></th>
                <th></th>
                <th></th>
            </tr>
        </tfoot>
        </table>

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
    this.isEditMode$.next(true);
  }

  cancelEdit(){
    this.isEditMode$.next(false);
  }

  markForDeletion(item, isDeleted){
    item.deleted = isDeleted;
  }

}