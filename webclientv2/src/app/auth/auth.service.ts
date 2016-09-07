import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Angular2TokenService} from "angular2-token/lib/angular2-token.service";
import {Router} from "@angular/router";
import {MessageService} from "../core/message.service";

@Injectable()
export class AuthService{

  constructor(
    private tokenService: Angular2TokenService,
    private router: Router,
    private messageService: MessageService
  ){}

  isAuthenticated():boolean{
    return localStorage.getItem("isLoggedIn") == "yes";
  }

  init(){
    this.tokenService.init();
  }

  login(email: string, password: string){
    this.tokenService
      .signIn(email, password)
      .subscribe(
        res => this.onSuccess(res),
        err => this.onError(err)
      );
  }

  logout(message?: string){

    if(!message){
      message = "Logged out successfully."
    }
    this.tokenService.signOut();
    localStorage.clear();
    this.messageService.setMessage(message);
    this.router.navigate(['/login']);
  }


  private onSuccess(result: any){
    //localStorage.setItem("email", res)
    localStorage.setItem("isLoggedIn", "yes");
    this.messageService.setMessage("Logged in successfully.");
    this.router.navigate(['/']);
  }

  private onError(error: any){
    this.messageService.setErrorMessage('Email or password is incorrect.');
  }
}
