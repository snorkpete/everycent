import {Component, Input, OnInit} from '@angular/core';
import {Icon} from '../ec-icon/icon.type';

@Component({
  selector: 'ec-deactivate-button',
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
export class DeactivateButtonComponent implements OnInit {
  @Input() item: any;

 @Input() get icon(): string {
    if (this.item && this.item.deactivated) {
      return Icon.ACTIVATE;
    } else {
      return Icon.DEACTIVATE;
    }
  }

  @Input() editMode = false;

  constructor() { }

  ngOnInit() {
  }

  toggle() {
    this.item.deactivated = !this.item.deactivated;
    this.item.status = this.item.deactivated ? 'closed' : 'open';
    this.item.unsaved = true;
  }

}
