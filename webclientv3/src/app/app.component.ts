import {Component, OnInit} from '@angular/core';
import 'rxjs/add/operator/map';

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
        <ec-main-toolbar (openMenu)="sidenav.open()"> </ec-main-toolbar>

        <mat-sidenav-container fxFlex>

            <mat-sidenav #sidenav opened="false" mode="overlay">
                <ec-menu (menuSelect)="sidenav.close()"></ec-menu>
            </mat-sidenav>

            <ec-loading-indicator></ec-loading-indicator>
            <ec-message-display></ec-message-display>
            <router-outlet></router-outlet>

        </mat-sidenav-container>
    </div>
  `,
})
export class AppComponent implements OnInit {
  title = 'ec works!';

  constructor(
  ) { }

  ngOnInit() {
  }
}
