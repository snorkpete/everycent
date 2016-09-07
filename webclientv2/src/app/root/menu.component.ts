
import {Component, Output, EventEmitter} from "@angular/core";
import {AuthService} from "../auth/auth.service";

@Component({
  styles:[`
    .active {
        color: red;
    }
  `],
  selector: 'ec-menu',
  template:`
    <ul>
    
    <li routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="exactLinkOption">Home</li>
    <li routerLink="/login" routerLinkActive="active">Login</li>
    <li (click)="logout()">Log Out</li>
    </ul>
    
  `
})
export class MenuComponent{

  exactLinkOption = { exact: true };

  @Output() close = new EventEmitter();

  constructor(
    private authService: AuthService
  ){}

  logout(){
    this.authService.logout();
    this.close.emit(true);
  }

}
