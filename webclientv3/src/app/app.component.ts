import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'ec-root',
  styles: [`
    :host {
        display: flex;
        flex: 1;
    }
  `],
  template: `
    <div fxLayout="column" fxFlex>
       <ec-main-toolbar (openMenu)="sideNav.toggle()"> </ec-main-toolbar>

         <mat-sidenav-container fxFlex class="main">

           <mat-sidenav #sideNav [opened]="true" mode="side">
             <ec-menu (menuSelect)="onMenuSelect()"></ec-menu>
           </mat-sidenav>

           <ec-loading-indicator></ec-loading-indicator>
           <ec-message-display></ec-message-display>
           <router-outlet></router-outlet>

         </mat-sidenav-container>
     </div>
  `,
})
export class AppComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit() {
  }

  onMenuSelect() {

  }

}
