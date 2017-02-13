import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MainToolbarService} from './main-toolbar.service';

@Component({
  selector: 'ec-main-toolbar',
  template: `
    <md-toolbar color="primary" *ngIf="toolbarService.isToolbarVisible()" class="menu-bar">
        <button md-icon-button class="open-menu-button" (click)="openMenu.emit()"><md-icon>menu</md-icon></button>
        <div class="full-width" fxLayout="row" fxLayoutAlign="space-between center">
            <span >EveryCent V3 </span>
            <span fxFlex>
                <div *ngIf="heading"> - {{ heading }}</div>
            </span>
            <a  routerLink="/logout">Log out</a>
        </div>
    </md-toolbar>
  `,
  styles: [`
    .full-width {
        width: 100%;
    }
    a {
        color: white;
        font-size: 0.7em;
    }
  `]
})
export class MainToolbarComponent implements OnInit {

  heading = 'Welcome to everycent';
  @Output() openMenu = new EventEmitter();

  constructor(
    public toolbarService: MainToolbarService
  ) { }

  ngOnInit() {
  }
}
