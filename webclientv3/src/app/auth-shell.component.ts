import { MediaMatcher } from "@angular/cdk/layout";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "ec-auth-shell",
  template: `
    <mat-sidenav-container>
      <mat-sidenav
        #sideNav
        [opened]="!mobileQuery.matches"
        [mode]="mobileQuery.matches ? 'over' : 'side'"
        [fixedInViewport]="true"
      >
        <ec-menu></ec-menu>
      </mat-sidenav>

      <mat-sidenav-content>
        <ec-main-toolbar (openMenu)="sideNav.toggle()"> </ec-main-toolbar>
        <div class="auth-shell-holding-container">
          <ec-loading-indicator></ec-loading-indicator>
          <ec-message-display></ec-message-display>
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
      }
      mat-sidenav-container {
        flex: 1;
      }
      ec-main-toolbar {
        position: fixed;
        top: 0px;
        width: 100%;
        z-index: 10000;
      }
      div.auth-shell-holding-container {
        margin-top: 45px;
        height: calc(100% - 45px);
        overflow: auto;
      }
    `
  ]
})
export class AuthShellComponent implements OnInit {
  mobileQuery: MediaQueryList;

  constructor(media: MediaMatcher) {
    this.mobileQuery = media.matchMedia("(max-width: 600px)");
  }

  ngOnInit() {}
}
