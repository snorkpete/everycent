import {Component} from "@angular/core";
import {Angular2TokenService} from "angular2-token/lib/angular2-token.service";
import {Response} from "@angular/http";
import {Router} from "@angular/router";
import {AuthService} from "./auth.service";
@Component({
  selector: 'ec-login',
  template:`
    <br/>
    <h2>EveryCent <small> the zero-based budget manager</small></h2>

    <br/>
    <br/>
    <ec-panel title="Sign In" type="primary">
        <form (submit)="logIn(email, password)" role="form">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" name="email" [(ngModel)]="email" required="required" class="form-control"/>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" name="password" [(ngModel)]="password" required="required" class="form-control"/>
          </div>

          <button type="submit" class="btn btn-primary btn-lg">Sign In</button>
        </form>
    </ec-panel>

    <br/>
  `
})
export class LoginComponent{

  constructor(
    private authService: AuthService
  ) {
  }

  logIn(email, password){
    this.authService.login(email, password);
  }

}
