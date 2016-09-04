import {Component, OnInit, Input} from "@angular/core";

@Component({
  selector: 'gg-card',
  styles: [],
  template: `
    <md-card>
      <md-toolbar [color]="color" *ngIf="title">
        <md-icon *ngIf="icon">{{icon}}</md-icon> <span *ngIf="icon">&nbsp; &nbsp;</span>
        {{ title }}
      </md-toolbar>
      <md-card-content>
        <ng-content></ng-content>
      </md-card-content>
    </md-card>
  `
})
export class CardComponent implements OnInit {

  @Input() public title: string;
  @Input() public icon: string;
  @Input() public color: string = 'primary';

  constructor() {}

  ngOnInit() {
  }

}


