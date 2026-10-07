import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot
} from "@angular/router";
import { MessageService } from "../../message-display/message.service";
import { AuthService } from "./auth.service";
import { LoginRedirect } from "./login-redirect.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private loginRedirect: LoginRedirect
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    this.messageService.clear();

    return this.authService.isLoggedIn().then(isLoggedIn => {
      if (!isLoggedIn) {
        this.loginRedirect.toLogin();
      }
      return isLoggedIn;
    });
  }
}
