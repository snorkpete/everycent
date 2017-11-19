import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ec-icon',
  styles: [`
    mat-icon {
        margin-right: 5px;
    }
  `],
  template: `
      <button md-icon-button *ngIf="iconType=='button'">
          <mat-icon>{{icon}}</mat-icon>
      </button>
      
      <mat-icon *ngIf="iconType!=='button'">{{icon}}</mat-icon>
  `
})
export class EcIconComponent implements OnInit {

  @Input() icon: string;
  @Input() iconType: string;

  constructor() { }

  ngOnInit() {
  }

}
