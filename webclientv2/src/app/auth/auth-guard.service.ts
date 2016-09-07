import {Injectable} from "@angular/core";
import {CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot, Router} from "@angular/router";
import {Observable} from "rxjs";
import {AuthService} from "./auth.service";
@Injectable()
export class AuthGuard implements CanActivate{

  constructor(
    private authService: AuthService
  ){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>|Promise<boolean>|boolean {
    if(! this.authService.isAuthenticated()){
      this.authService.logout('Please Log in.');
      return false;
    }
    //return this.authService.isAuthenticated();
    return true;
  }

}
