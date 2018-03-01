import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {AuthService} from '../../core/auth/auth.service';
import {Icon} from '../ec-icon/icon.type';

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

      <ec-menu-item [icon]="Icon.HOME" route="/">
        Home
      </ec-menu-item>

      <ec-menu-item [icon]="Icon.BUDGETS" route="/budgets/current">
        Current Budget
      </ec-menu-item>

      <ec-menu-item [icon]="Icon.BUDGETS" route="/budgets">
        Budgets
      </ec-menu-item>

      <ec-menu-item [icon]="Icon.TRANSACTIONS" route="/transactions">
        Transactions
      </ec-menu-item>

      <ec-menu-item [icon]="Icon.MENU" route="/sink-funds">
        Sink Funds
      </ec-menu-item>

      <ec-menu-item [icon]="Icon.ACCOUNT_BALANCES" route="/account-balances">
        Account Balances
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
