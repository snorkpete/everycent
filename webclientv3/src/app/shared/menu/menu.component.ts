import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {AuthService} from '../../core/auth/auth.service';
import {Icon} from '../ec-icon/icon.type';

export interface MenuItemConfig {
  displayName: string;
  icon: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'ec-menu',
  styles: [`
  `],
  template: `
    <mat-list>

      <mat-divider></mat-divider>
      <mat-list-item>
        <ec-icon [icon]="Icon.HOME"></ec-icon>
        <a href="/">Go to Old Version </a>
      </mat-list-item>
      <mat-divider></mat-divider>

      <ec-menu-item *ngFor="let menuItem of menuItems"
                    [icon]="menuItem.icon"
                    [route]="menuItem.route"
                    [exactRoute]="menuItem.exact === true"
      >
        {{ menuItem.displayName }}
      </ec-menu-item>

      <mat-divider></mat-divider>
      <mat-list-item (click)="logOut()">
        <ec-icon [icon]="Icon.LOGOUT"></ec-icon>
        Log out
      </mat-list-item>
      <mat-divider></mat-divider>
    </mat-list>
  `,
})
export class MenuComponent implements OnInit {

  Icon = Icon;

  @Output()
  menuSelect = new EventEmitter();

  menuItems: MenuItemConfig[] = [
    { displayName: 'Home', icon: Icon.HOME, route: "/", exact: true },
    { displayName: 'Current Budget', icon: Icon.BUDGETS_CURRENT, route: "/budgets/current", exact: true },
    { displayName: 'Budgets', icon: Icon.BUDGETS, route: "/budgets", exact: false },
    { displayName: 'Future Budgets', icon: Icon.BUDGETS_FUTURE, route: "/budgets/future", exact: true },
    { displayName: 'Transactions', icon: Icon.TRANSACTIONS, route: "/transactions" },
    { displayName: 'Sink Funds', icon: Icon.SINK_FUND, route: "/sink-funds" },
    { displayName: 'Account Balances', icon: Icon.ACCOUNT_BALANCES, route: "/account-balances" },
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.router.events
        .filter(e => e instanceof NavigationEnd)
        .subscribe(e => this.menuSelect.emit());
  }

  logOut(): void {
    this.authService.logOut().then(() => {
      this.menuSelect.emit();
      this.router.navigate(['/login']);
    });
  }

}
