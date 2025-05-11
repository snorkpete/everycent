import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";
import { AuthService } from "../../core/auth/auth.service";
import { Icon } from "../ec-icon/icon.type";

export interface MenuItemConfig {
  displayName: string;
  icon: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: "ec-menu",
  styles: [
    `
      .mat-expansion-panel-header {
        padding: 0 16px;
        font-size: 16px;
      }
      mat-expansion-panel-header ::ng-deep .mat-content {
        align-items: center;
      }
    `
  ],
  template: `
    <mat-nav-list>
      <mat-divider></mat-divider>

      <ec-menu-item
        *ngFor="let menuItem of menuItems"
        [icon]="menuItem.icon"
        [route]="menuItem.route"
        [exactRoute]="menuItem.exact === true"
      >
        {{ menuItem.displayName }}
      </ec-menu-item>

      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <ec-icon [icon]="Icon.REPORTING"></ec-icon>
          Reports
        </mat-expansion-panel-header>
        <ec-menu-item
          *ngFor="let menuItem of reportingMenuItems"
          [icon]="menuItem.icon"
          [route]="menuItem.route"
          [exactRoute]="menuItem.exact === true"
        >
          {{ menuItem.displayName }}
        </ec-menu-item>
      </mat-expansion-panel>

      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <ec-icon [icon]="Icon.SETUP"></ec-icon>
          Setup
        </mat-expansion-panel-header>
        <ec-menu-item
          *ngFor="let menuItem of setupMenuItems"
          [icon]="menuItem.icon"
          [route]="menuItem.route"
          [exactRoute]="menuItem.exact === true"
        >
          {{ menuItem.displayName }}
        </ec-menu-item>
      </mat-expansion-panel>

      <mat-divider></mat-divider>
      <mat-list-item (click)="logOut()">
        <ec-icon [icon]="Icon.LOGOUT"></ec-icon>
        Log out
      </mat-list-item>
      <mat-divider></mat-divider>
    </mat-nav-list>
  `
})
export class MenuComponent implements OnInit {
  Icon = Icon;

  @Output() menuSelect = new EventEmitter();

  menuItems: MenuItemConfig[] = [
    { displayName: "Home", icon: Icon.HOME, route: "/", exact: true },
    {
      displayName: "Current Budget",
      icon: Icon.BUDGETS_CURRENT,
      route: "/budgets/current",
      exact: true
    },
    {
      displayName: "Budgets",
      icon: Icon.BUDGETS,
      route: "/budgets",
      exact: false
    },
    {
      displayName: "Future Budgets",
      icon: Icon.BUDGETS_FUTURE,
      route: "/budgets/future",
      exact: true
    },
    // {
    //   displayName: "Weekly Budget(WIP)",
    //   icon: Icon.BUDGETS_WEEKLY,
    //   route: "/budgets/weekly",
    //   exact: true
    // },
    {
      displayName: "Transactions",
      icon: Icon.TRANSACTIONS,
      route: "/transactions"
    },
    { displayName: "Sink Funds", icon: Icon.SINK_FUND, route: "/sink-funds" },
    {
      displayName: "Account Balances",
      icon: Icon.ACCOUNT_BALANCES,
      route: "/account-balances"
    },
    {
      displayName: "Special Events",
      icon: Icon.SPECIAL_EVENTS,
      route: "/special-events"
    }
  ];

  setupMenuItems: MenuItemConfig[] = [
    {
      displayName: "Allocation Categories",
      icon: Icon.ALLOCATION_CATEGORIES,
      route: "/setup/allocation-categories",
      exact: false
    },
    {
      displayName: "Financial Institutions",
      icon: Icon.INSTITUTIONS,
      route: "/setup/institutions",
      exact: false
    },
    {
      displayName: "Bank Accounts",
      icon: Icon.BANK_ACCOUNTS,
      route: "/setup/bank-accounts",
      exact: false
    },
    {
      displayName: "Special Events",
      icon: Icon.SPECIAL_EVENTS,
      route: "/setup/special-events",
      exact: false
    },
    {
      displayName: "Settings",
      icon: Icon.SETTINGS,
      route: "/setup/settings",
      exact: false
    }
  ];

  reportingMenuItems: MenuItemConfig[] = [
    {
      displayName: "Net Worth Report",
      icon: Icon.NET_WORTH,
      route: "/reports/net-worth",
      exact: false
    },
    {
      displayName: "Category Spending Report",
      icon: Icon.CATEGORY_SPENDING,
      route: "/reports/category-spending",
      exact: false
    },
    {
      displayName: "Needs vs Wants Report",
      icon: Icon.NEEDS_VS_WANTS,
      route: "/reports/needs-vs-wants",
      exact: false
    }
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.menuSelect.emit());
  }

  logOut(): void {
    this.authService.logOut().then(() => {
      this.menuSelect.emit();
      this.router.navigate(["/login"]);
    });
  }
}
