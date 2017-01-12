import {Component, Output, EventEmitter, Input} from "@angular/core";
import {Icons} from "../../shared/icons.constants";
@Component({
  selector: 'ec-income-list-editor-actions',
  template: `
     <div>
        <ec-icon-button [icon]="Icons.EDIT" (click)="switchToEditMode.emit($event)" *ngIf="!isEditMode" >
           Make Changes 
        </ec-icon-button>
        
        
        <ec-icon-button [icon]="Icons.ADD" *ngIf="isEditMode" (click)="addIncome.emit($event)">
                  Add Income
        </ec-icon-button>
        
        <div align="end" *ngIf="isEditMode">
            <ec-icon-button color="warn" [icon]="Icons.CLOSE" (click)="cancel.emit($event)">
                Cancel
            </ec-icon-button>
        </div>
      </div>
  `
})
export class IncomeListEditorActionsComponent{
  Icons = Icons;
  @Input() isEditMode: boolean;

  @Output() switchToEditMode = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() addIncome = new EventEmitter();
}