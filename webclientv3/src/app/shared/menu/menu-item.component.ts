import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ec-menu-item',
  styles: [`
      md-list-item.active {
          color: blue;
      }
      md-list-item {
          cursor: pointer;
      }
  `],
  template: `
      <md-divider></md-divider>
      <md-list-item [routerLink]="route" routerLinkActive="active"
                    [routerLinkActiveOptions]="linkActiveOptions()">
          <ec-icon [icon]="icon"></ec-icon>
          <ng-content></ng-content>
      </md-list-item>
      <md-divider></md-divider>
  `
})
export class MenuItemComponent implements OnInit {

  @Input() icon = '';
  @Input() route = '';

  constructor() { }

  ngOnInit() {
  }

  linkActiveOptions() {
    return {
       exact: this.route === '/'
    };
  }

}
