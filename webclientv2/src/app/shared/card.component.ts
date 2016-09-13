import {Component, OnInit, Input} from "@angular/core";

@Component({
  selector: 'ec-card, ec-panel',
  styles: [`
    md-card-actions{
        margin-left: 0px;
    }
  `],
  template: `
    <md-card>
      <ec-toolbar [title]="title" [color]="color" [icon]="icon"></ec-toolbar>
      <md-card-content>
        <ng-content></ng-content>
      </md-card-content>
      
      <md-card-actions>
        <ng-content select="[md-card-actions],[ec-card-actions],md-card-actions"></ng-content>
      </md-card-actions>
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


