import {Component, Input, Output, EventEmitter} from "@angular/core";
@Component({
  selector: 'ec-icon-button',
  template: `
    <button md-raised-button [color]="color" (click)="onClick($event)">
        <i class="material-icons">{{icon}}</i>
        <ng-content></ng-content>
    </button>
  `
})
export class IconButton{
  @Input() color: string = 'primary';
  @Output() click = new EventEmitter();
  @Input() icon: string = '';

  onClick(event){
    this.click.emit(event);
  }
}
