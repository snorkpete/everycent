import {Component} from "@angular/core";
import {Angular2TokenService} from "angular2-token/lib/angular2-token.service";
import {Response} from "@angular/http";
import {Router} from "@angular/router";
import {AuthService} from "./auth.service";
import {ApiGateway} from "../core/api-gateway.service";
@Component({
  styles:[`
    .fields{
        margin-top: 15px;
    }
    div.main{
        margin: 20px 30%;
    }
  `],
  selector: 'ec-login',
  template:`
    <br/>
    <br/>
    <div class="main">
      <ec-panel title="EveryCent - Sign In" type="primary">
          <form (submit)="logIn(email, password)" role="form">
              <div layout="column" class="fields">
                 <md-input placeholder="Email Address" [(ngModel)]="email" name="email"> </md-input> 
                 <md-input placeholder="Password" type="password" [(ngModel)]="password" name="password"> </md-input> 
              </div>
              <div class="center">
                 <button md-raised-button color="accent">Sign In </button>
              </div>
          </form>
      </ec-panel>
    </div>
  `
})
export class LoginComponent{

  lastUpdate;

  constructor(
    private authService: AuthService,
    private apiGateway: ApiGateway
  ) {
  }

  logIn(email, password){
    this.authService.login(email, password);
  }

  ngOnInit(): void {
  }


}
