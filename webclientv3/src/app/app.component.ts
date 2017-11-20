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
       <!--<ec-main-toolbar (openMenu)="sidenav.open()"> </ec-main-toolbar>-->
      <ec-main-toolbar (openMenu)="opened()"> </ec-main-toolbar>

      app component
         <!--<mat-sidenav-container fxFlex>-->
      <!---->
           <!--<mat-sidenav #sidenav opened="false" mode="overlay">-->
             <!--<ec-menu (menuSelect)="sidenav.close()"></ec-menu>-->
           <!--</mat-sidenav>-->
      <!---->
           <!--&lt;!&ndash;<ec-loading-indicator></ec-loading-indicator>&ndash;&gt;-->
           <!--&lt;!&ndash;<ec-message-display></ec-message-display>&ndash;&gt;-->
           <!--&lt;!&ndash;<router-outlet></router-outlet>&ndash;&gt;-->
      <!---->
         <!--</mat-sidenav-container>-->
     </div>
  `,
})
export class AppComponent implements OnInit {
  title = 'ec works!';

  constructor(
  ) { }

  ngOnInit() {
  }
  opened() {
    alert('hello')
  }
}
