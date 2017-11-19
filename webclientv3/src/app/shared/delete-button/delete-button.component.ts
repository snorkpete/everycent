import {Component, Input, OnInit} from '@angular/core';
import {Icon} from '../ec-icon/icon.type';

@Component({
  selector: 'ec-delete-button',
  styles: [`
    span {
        cursor: pointer;
    }
  `],
  template: `
    <span (click)="toggle()" *ngIf="editMode">
      <ec-icon [icon]="icon"></ec-icon>
    </span>
  `
})
export class DeleteButtonComponent implements OnInit {
  @Input() item: any;

 @Input() get icon(): string {
    if (this.item && this.item.deleted) {
      return Icon.UNDO_DELETE;
    } else {
      return Icon.DELETE;
    }
  }

  @Input() editMode = false;

  constructor() { }

  ngOnInit() {
  }

  toggle() {
    this.item.deleted = !this.item.deleted;
  }

}
