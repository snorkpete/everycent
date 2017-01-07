import {Component, Input} from "@angular/core";
@Component({
  selector: 'ec-delete-button',
  template: `
    <div>
        <button md-mini-fab (click)="markForDeletion(true)" *ngIf="!item.deleted" color="warn">
            <md-icon>delete_forever</md-icon>
        </button>
        
        <button md-mini-fab (click)="markForDeletion(false)" *ngIf="item.deleted" color="accent">
            <md-icon>refresh</md-icon>
        </button>
    </div>
  `
})
export class DeleteButtonComponent{
  @Input() item: any;

  markForDeletion(isDeleted: boolean){
    this.item.deleted = isDeleted;
  }
}
