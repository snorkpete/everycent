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
    <mat-toolbar color="primary" *ngIf="toolbarService.isToolbarVisible()" class="menu-bar">
        <mat-toolbar-row>
          <ec-icon iconType="button"
                   [icon]="Icon.MENU"
                   class="open-menu-button"
                   (click)="openMenu.emit()">
          </ec-icon>
          
          EveryCent V3
          
            <span *ngIf="getMainHeading()" fxHide.xs class="heading">
                -- {{ getMainHeading() }}
            </span>
        </mat-toolbar-row>

        <mat-toolbar-row fxHide.gt-xs>
           {{ getMainHeading() }}
        </mat-toolbar-row>
    </mat-toolbar>
  `,
})
export class MainToolbarComponent implements OnInit {

  @Output() openMenu = new EventEmitter();
  Icon = Icon;

  constructor(
    public toolbarService: MainToolbarService
  ) { }

  ngOnInit() {
    this.toolbarService.setHeading('Welcome to EveryCent');
  }

  getMainHeading(): string {
    return this.toolbarService.getHeading();
  }
}
