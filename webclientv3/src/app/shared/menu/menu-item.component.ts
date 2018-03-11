import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ec-menu-item',
  styles: [`
      mat-list-item.active {
          color: blue;
      }
      mat-list-item {
          cursor: pointer;
      }
  `],
  template: `
      <mat-divider></mat-divider>
      <mat-list-item [routerLink]="route" routerLinkActive="active"
                    [routerLinkActiveOptions]="{ exact: exactRoute }">
          <ec-icon [icon]="icon"></ec-icon>
          <ng-content></ng-content>
      </mat-list-item>
      <mat-divider></mat-divider>
  `
})
export class MenuItemComponent implements OnInit {

  @Input() icon = '';
  @Input() route = '';
  @Input() exactRoute = false;

  constructor() { }

  ngOnInit() {
  }

  linkActiveOptions() {
    return {
       exact: this.route === '/'
    };
  }

  routerLinkOptions() {
    return {
      exact: this.exactRoute
    };
  }

}
