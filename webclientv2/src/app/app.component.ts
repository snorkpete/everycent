import {Component, OnInit} from "@angular/core";
import {AuthService} from "./auth/auth.service";
import {Observable, BehaviorSubject} from "rxjs";
import {MenuDisplayService} from "./core/menu-display.service";
@Component({
  styles:[`
    md-toolbar {
        margin-left: 10px;
        margin-right: 10px;
    }
  `],
  selector: 'gg-app',
  template: `
    <md-sidenav-layout fullscreen>
    
      <md-sidenav #sidenav opened="true" mode="side">
        <ec-menu (close)="sidenav.close()"></ec-menu>
      </md-sidenav>
      
      <md-toolbar color="primary" *ngIf="showMenu$ | async">
        <button md-icon-button (click)="sidenav.toggle()"><md-icon>menu</md-icon></button>
        EveryCent V2 &nbsp; <span *ngIf="heading$ | async"> - {{ heading$ | async }}</span>
      </md-toolbar>
      
      <ec-card>
        <ec-message-display></ec-message-display>
        <router-outlet></router-outlet>
      </ec-card>
    </md-sidenav-layout>
  `
})
export class AppComponent implements OnInit{

  showMenu$: Observable<boolean>;
  heading$ : Observable<string>;

  constructor(
    private authService: AuthService,
    private menuDisplayService: MenuDisplayService
  ){
    this.authService.init();
  }

  ngOnInit(){
    this.showMenu$ = this.menuDisplayService.isMenuVisible$();
    this.heading$ = this.menuDisplayService.getHeading$();
  }
}