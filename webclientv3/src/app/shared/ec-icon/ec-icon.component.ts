import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ec-icon',
  styles: [`
    md-icon {
        margin-right: 5px;
    }
  `],
  template: `
      <button md-icon-button *ngIf="iconType=='button'">
          <md-icon>{{icon}}</md-icon>
      </button>
      
      <md-icon *ngIf="iconType!=='button'">{{icon}}</md-icon>
  `
})
export class EcIconComponent implements OnInit {

  @Input() icon: string;
  @Input() iconType: string;

  constructor() { }

  ngOnInit() {
  }

}
