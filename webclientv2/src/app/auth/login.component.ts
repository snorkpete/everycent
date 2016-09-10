import {Component, OnInit} from "@angular/core";
import {Angular2TokenService} from "angular2-token/lib/angular2-token.service";
import {Response} from "@angular/http";
import {Router} from "@angular/router";
import {AuthService} from "./auth.service";
import {ApiGateway} from "../core/api-gateway.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
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
          <form [formGroup]="form" (ngSubmit)="logIn()" role="form">
              <div layout="column" class="fields">
                 <md-input placeholder="Email Address" formControlName="email"> </md-input> 
                 <md-input placeholder="Password" type="password" formControlName="password"> </md-input> 
              </div>
              <div class="center">
                 <button md-raised-button color="accent">Sign In </button>
              </div>
          </form>
      </ec-panel>
    </div>
  `
})
export class LoginComponent implements OnInit{

  lastUpdate;
  form: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private apiGateway: ApiGateway
  ) {
  }


  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
  }


  logIn(){
    this.authService.login(this.form.value.email, this.form.value.password);
  }

}
