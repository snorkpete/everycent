import {Component, OnInit} from '@angular/core';
import 'rxjs/add/operator/map';

@Component({
  selector: 'ec-root',
  styles: [`
  `],
  template: `
      <md-sidenav-container fullscreen>

          <md-sidenav #sidenav opened="false" mode="overlay">
              <ec-menu (menuSelect)="sidenav.close()"></ec-menu>
          </md-sidenav>
              
          <ec-main-toolbar (openMenu)="sidenav.open()"> </ec-main-toolbar>    
          <ec-loading-indicator></ec-loading-indicator>
          <ec-message-display></ec-message-display>
          <router-outlet></router-outlet>

      </md-sidenav-container>
  `,
})
export class AppComponent implements OnInit {
  title = 'ec works!';

  constructor(
  ) { }

  ngOnInit() {
  }
}
