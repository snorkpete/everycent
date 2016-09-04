import {Component, OnInit} from "@angular/core";
@Component({
  selector: 'gg-app',
  template: `
    <md-sidenav-layout fullscreen>
      <md-sidenav #sidenav opened="true">
        <h3>Menu options go here</h3>
      </md-sidenav>
      <md-toolbar color="primary">
        <button md-icon-button (click)="sidenav.toggle()"><md-icon>menu</md-icon></button>
        EveryCent V2 &nbsp;&nbsp;&nbsp;<small>built with Angular 2</small> 
      </md-toolbar>
    </md-sidenav-layout>
  `
})
export class AppComponent implements OnInit{
  ngOnInit(){
  }
}