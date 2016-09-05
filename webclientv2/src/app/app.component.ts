import {Component, OnInit} from "@angular/core";
import {AuthService} from "./auth/auth.service";
@Component({
  selector: 'gg-app',
  template: `
    <md-sidenav-layout fullscreen>
      <md-sidenav #sidenav opened="false">
        <h3>Menu options go here</h3>
        <ec-menu (close)="sidenav.close()"></ec-menu>
      </md-sidenav>
      <md-toolbar color="primary">
        <button md-icon-button (click)="sidenav.toggle()"><md-icon>menu</md-icon></button>
        EveryCent V2 &nbsp;&nbsp;&nbsp;<small>built with Angular 2</small> 
      </md-toolbar>
      
      <ec-message-display></ec-message-display>
      <router-outlet></router-outlet>
      
    </md-sidenav-layout>
  `
})
export class AppComponent implements OnInit{
  constructor(private authService: AuthService){
    this.authService.init();
  }

  ngOnInit(){

  }
}