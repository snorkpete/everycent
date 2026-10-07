import { Injectable } from "@angular/core";
import { ApiGateway } from "../../../api/api-gateway.service";
import { clearAuthToken, hasAuthToken } from "./auth-token";

// Login is handled by the Vue app (webclientv4); v3 only checks for the
// shared session token and signs out.
@Injectable()
export class AuthService {
  constructor(private apiGateway: ApiGateway) {}

  logOut(): Promise<any> {
    return this.apiGateway
      .delete("/auth/sign_out")
      .toPromise()
      .catch(() => undefined)
      .then(() => {
        clearAuthToken();
        return true;
      });
  }

  /**
   * A missing token means logged out. An invalid or expired token is caught
   * later, when the API responds with a 401.
   */
  isLoggedIn(): Promise<boolean> {
    return Promise.resolve(hasAuthToken());
  }
}
