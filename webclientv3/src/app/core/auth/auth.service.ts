import { throwError as observableThrowError, Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { catchError, map, tap } from "rxjs/operators";
import { ApiGateway } from "../../../api/api-gateway.service";

import { AuthCredentials } from "./auth-credentials";

@Injectable()
export class AuthService {
  private loggedIn = false;

  constructor(private apiGateway: ApiGateway) {}

  logIn(email: string, password: string): Promise<any> {
    return this.apiGateway
      .postWithoutAuthentication("/auth/sign_in", { email, password })
      .pipe(
        tap(userCredentials => {
          this.loggedIn = true;
          this.saveCredentials(userCredentials);
        }),
        catchError(error => {
          // On any error, clear the credentials and rethrow the error
          this.clearCredentials();
          return observableThrowError(error);
        })
      )
      .toPromise();
  }

  logOut(): Promise<any> {
    this.clearCredentials();
    return Promise.resolve(true);
  }

  /**
   *
   * @returns Promise<boolean> that resolves to true or false depending on logged in status
   */
  isLoggedIn(): Promise<boolean> {
    if (this.loggedIn) {
      return Promise.resolve(true);
    }

    let authCredentials = AuthCredentials.fromLocalStorage();
    if (!authCredentials.hasAccessToken()) {
      this.loggedIn = false;
      return Promise.resolve(false);
    }

    return this.apiGateway
      .get("/auth/validate_token")
      .pipe(
        map(result => result.success),
        tap(() => (this.loggedIn = true)),
        catchError(() => {
          this.loggedIn = false;
          return observableThrowError(false);
        })
      )
      .toPromise();
  }

  private saveCredentials(userCredentials: any): void {
    localStorage.setItem("access-token", userCredentials["access-token"]);
    localStorage.setItem("client", userCredentials["client"]);
    localStorage.setItem("expiry", userCredentials["expiry"]);
    localStorage.setItem("token-type", userCredentials["token-type"]);
    localStorage.setItem("uid", userCredentials["uid"]);
  }

  private clearCredentials(): void {
    localStorage.removeItem("access-token");
    localStorage.removeItem("client");
    localStorage.removeItem("expiry");
    localStorage.removeItem("token-type");
    localStorage.removeItem("uid");
  }
}
