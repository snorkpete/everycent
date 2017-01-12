import {Component, OnInit, Input} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'ec-income-list-editor',
  template: `
    <ec-card title="Incomes" type="primary">
       <div class="compact" *ngIf="budget?.incomes">
       
           <ec-income-list-editor-header-row [isEditMode]="isEditMode$ | async">
           </ec-income-list-editor-header-row>
           
           <ec-income-list-editor-row 
               *ngFor="let income of budget.incomes"
               [income]="income"
               [isViewMode]="!(isEditMode$ | async)"
                >
           </ec-income-list-editor-row>
           
           <ec-income-list-editor-footer-row 
             [incomes]="budget.incomes"
             [isEditMode]="isEditMode$ | async">
           
           </ec-income-list-editor-footer-row>
       </div>
       
       <ec-income-list-editor-actions ec-card-actions *ngIf="isEditable()"
        [isEditMode]="isEditMode$ | async"
        (switchToEditMode)="switchToEditMode()"
        (addIncome)="addNewIncome()"
        (cancel)="cancelEdit()"
       >
       
       </ec-income-list-editor-actions>

     </ec-card>
  `
})
export class IncomeListEditorComponent implements OnInit{

  @Input() budget: any = {};

  isEditMode$ = new BehaviorSubject<boolean>(false);
  isViewMode$: Observable<boolean>;

  private originalIncomes: any[];

  ngOnInit(): void {
    this.isViewMode$ = this.isEditMode$.map(mode => !mode);
  }

  isEditable(){
    return this.budget && this.budget.status == 'open';
  }

  addNewIncome(){
    console.log('add new')
    this.budget.incomes.push({amount: 0});
  }

  switchToEditMode(){
    console.log('edit mode')
    this.isEditMode$.next(true);
    this.originalIncomes = this.budget.incomes;
  }

  cancelEdit(){
    console.log('cancel')
    this.isEditMode$.next(false);
    this.budget.incomes = this.originalIncomes;
  }

}