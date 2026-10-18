import { Injectable } from "@angular/core";
import { ApiGateway } from "../../../api/api-gateway.service";
import { clearAuthToken, getAuthToken } from "./auth-token";

// Login is handled by the Vue app (webclientv4); v3 only checks for the
// shared session token and signs out.
@Injectable()
export class AuthService {
  // The token the server last confirmed. Keyed by value rather than a flag:
  // the token is shared with the Vue app, which may swap it (re-login) while
  // this app stays open.
  private validatedToken: string | null = null;
  private pendingValidation: Promise<boolean> | null = null;

  constructor(private apiGateway: ApiGateway) {}

  logOut(): Promise<any> {
    return this.apiGateway
      .delete("/auth/sign_out")
      .toPromise()
      .catch(() => undefined)
      .then(() => {
        clearAuthToken();
        this.validatedToken = null;
        this.pendingValidation = null;
        return true;
      });
  }

  /**
   * A missing token means logged out. Otherwise the token is validated against
   * the server; a successful result is cached for as long as the token stays
   * the same, so repeated route guards don't re-validate.
   */
  isLoggedIn(): Promise<boolean> {
    const token = getAuthToken();
    if (token === null) {
      return Promise.resolve(false);
    }
    if (token === this.validatedToken) {
      return Promise.resolve(true);
    }

    // Share one in-flight request between guards firing at the same time.
    if (!this.pendingValidation) {
      this.pendingValidation = this.validate(token).then(valid => {
        this.pendingValidation = null;
        return valid;
      });
    }
    return this.pendingValidation;
  }

  private validate(token: string): Promise<boolean> {
    return this.apiGateway
      .getOrThrow("/auth/validate")
      .toPromise()
      .then(result => {
        // success:false does not clear the token either: only a 401 does.
        const valid = result?.success === true;
        if (valid) {
          this.validatedToken = token;
        }
        return valid;
      })
      .catch(error => {
        if (error && error.status === 401) {
          // The token is shared with the Vue app, so only a 401 proves it is
          // dead and safe to clear.
          clearAuthToken();
          return false;
        }
        // Network failure or 5xx: we can't tell whether the token is valid.
        // Leave it in place and let the pages' own requests surface the failure.
        return true;
      });
  }
}
