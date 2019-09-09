import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from "@angular/router";
import { Observable } from "rxjs";
import { MessageService } from "../../message-display/message.service";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    this.messageService.clear();

    return this.authService
      .isLoggedIn()
      .then(isLoggedIn => {
        if (isLoggedIn) {
          return isLoggedIn;
        }
        throw new Error("not logged in");
      })
      .catch(error => {
        this.messageService.setErrorMessage("Not logged in");
        this.router.navigate(["/login"]);
        return error;
      });
  }
}
