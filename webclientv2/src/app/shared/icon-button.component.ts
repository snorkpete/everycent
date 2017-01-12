import {Component, Input, Output, EventEmitter} from "@angular/core";
@Component({
  selector: 'ec-icon-button',
  template: `
    <button md-raised-button [color]="color">
        <i class="material-icons">{{icon}}</i>
        <ng-content></ng-content>
    </button>
  `
})
export class IconButton{
  @Input() color: string = 'primary';
  @Input() icon: string = '';
}
