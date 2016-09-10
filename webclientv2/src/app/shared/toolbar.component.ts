import {Component, OnInit, Input} from "@angular/core";

@Component({
  selector: 'ec-toolbar',
  styles: [`
    md-icon{
        margin-right: 10px;
    }
  `],
  template: `
    <md-toolbar [color]="color" *ngIf="title">
      <md-icon *ngIf="icon">{{icon}}</md-icon> <span *ngIf="icon">&nbsp; &nbsp;</span>
      {{ title }}
    </md-toolbar>
  `
})
export class ToolbarComponent implements OnInit {

  @Input() public title: string;
  @Input() public icon: string;
  @Input() public color: string = 'primary';

  constructor() {}

  ngOnInit() {
  }

}

