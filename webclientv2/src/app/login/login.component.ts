import {Component} from "@angular/core";
import {Angular2TokenService} from "angular2-token/lib/angular2-token.service";
import {Response} from "@angular/http";
@Component({
  selector: 'ec-login',
  template:`
    <br/>
    <h2>EveryCent <small> the zero-based budget manager</small></h2>

    <br/>
    <br/>
    <ec-panel title="Sign In" type="primary">
        <form ng-submit="vm.signIn(vm.loginForm)" role="form">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" name="email" ng-model="vm.loginForm.email" required="required" class="form-control"/>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" name="password" ng-model="vm.loginForm.password" required="required" class="form-control"/>
          </div>

          <button type="submit" class="btn btn-primary btn-lg">Sign In</button>
        </form>
    </ec-panel>

    <br/>
  `
})
export class LoginComponent{

  constructor(
    private tokenService: Angular2TokenService
    //$state,
    //UserService,
    //MessageService
  ) {
  }

  signIn(email, password){
    this.tokenService
        .signIn(email, password)
        .subscribe(
          res => this.onSuccess(res),
          (err) => this.onError(err)
        );
  }

  private onSuccess(result: any){

    //UserService.setupUser(response);
    //MessageService.setMessage('Logged in successfully.');
    //$state.go('home');
    console.log('logged in successfully')
    console.log(result);
  }

  private onError(error: any){
    //MessageService.setErrorMessage('Email or password is incorrect.');
    //return true; // handled the error, so return true
    console.error('email or password is incorrect')
    console.error(error);
  }

}
