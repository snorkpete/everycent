import { Component, OnInit } from "@angular/core";

@Component({
  selector: "ec-root",
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
      div.holding-container {
        margin-top: 35px;
      }
  `
  ],
  template: `
       <mat-sidenav-container>

         <mat-sidenav #sideNav [opened]="true" mode="side" [fixedInViewport]="true">
           <ec-menu (menuSelect)="onMenuSelect()"></ec-menu>
         </mat-sidenav>

         <mat-sidenav-content>
           <ec-main-toolbar (openMenu)="sideNav.toggle()"> </ec-main-toolbar>
           <div class="holding-container">
             <ec-loading-indicator></ec-loading-indicator>
             <ec-message-display></ec-message-display>
             <router-outlet></router-outlet>
           </div>
         </mat-sidenav-content>

       </mat-sidenav-container>
  `
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  onMenuSelect() {}
}
