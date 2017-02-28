import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MainToolbarService} from './main-toolbar.service';
import {Icon} from '../ec-icon/icon.type';

@Component({
  selector: 'ec-main-toolbar',
  styles: [`
    .heading {
    }
  `],
  template: `
    <md-toolbar color="primary" *ngIf="toolbarService.isToolbarVisible()" class="menu-bar">

        <ec-icon iconType="button"
                 [icon]="Icon.MENU"
                 class="open-menu-button"
                 (click)="openMenu.emit()">
        </ec-icon>
        EveryCent V3
        <span *ngIf="heading" fxHide.xs class="heading">
            --- {{ heading }}
        </span>

        <md-toolbar-row fxHide.gt-xs>
           {{ heading }}
        </md-toolbar-row>
    </md-toolbar>
  `,
})
export class MainToolbarComponent implements OnInit {

  heading = 'Welcome to Everycent';
  @Output() openMenu = new EventEmitter();
  Icon = Icon;

  constructor(
    public toolbarService: MainToolbarService
  ) { }

  ngOnInit() {
  }
}
