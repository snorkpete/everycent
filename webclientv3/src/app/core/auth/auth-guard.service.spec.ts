import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AuthGuard } from "./auth-guard.service";

describe("AuthGuard", () => {
  let authGuard: AuthGuard;
  let messageService: { clear: jasmine.Spy };
  let authService: { isLoggedIn: jasmine.Spy };
  let loginRedirect: { toLogin: jasmine.Spy };

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    messageService = { clear: jasmine.createSpy("clear") };
    authService = { isLoggedIn: jasmine.createSpy("isLoggedIn") };
    loginRedirect = { toLogin: jasmine.createSpy("toLogin") };
    authGuard = new AuthGuard(
      messageService as any,
      authService as any,
      loginRedirect as any
    );
  });

  describe("canActivate()", () => {
    it("clears any displayed messages", async () => {
      authService.isLoggedIn.and.returnValue(Promise.resolve(true));

      await authGuard.canActivate(route, state);

      expect(messageService.clear).toHaveBeenCalled();
    });

    it("allows access when logged in", async () => {
      authService.isLoggedIn.and.returnValue(Promise.resolve(true));

      expect(await authGuard.canActivate(route, state)).toEqual(true);
      expect(loginRedirect.toLogin).not.toHaveBeenCalled();
    });

    it("redirects to login and blocks access when not logged in", async () => {
      authService.isLoggedIn.and.returnValue(Promise.resolve(false));

      expect(await authGuard.canActivate(route, state)).toEqual(false);
      expect(loginRedirect.toLogin).toHaveBeenCalled();
    });
  });
});
