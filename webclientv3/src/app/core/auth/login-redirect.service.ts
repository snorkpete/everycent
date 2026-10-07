import { Injectable } from "@angular/core";

// v3 has no login page of its own - unauthenticated users are sent to the
// Vue app's login, which is served from the site root.
@Injectable({ providedIn: "root" })
export class LoginRedirect {
  toLogin(): void {
    window.location.replace("/#/login");
  }
}
