import { TestBed, waitForAsync } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { TestConfigModule } from "../../../../test/test-config.module";
import { ApiGateway } from "../../../api/api-gateway.service";
import { LoadingIndicator } from "../../shared/loading-indicator/loading-indicator.service";
import { AUTH_TOKEN_KEY } from "./auth-token";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let authService: AuthService;
  let apiGateway: ApiGateway;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule],
      providers: [AuthService, ApiGateway, LoadingIndicator]
    });
    authService = TestBed.inject(AuthService);
    apiGateway = TestBed.inject(ApiGateway);
    localStorage.clear();
  });

  describe("logOut()", () => {
    it("calls the sign out endpoint", waitForAsync(() => {
      const spy = spyOn(apiGateway, "delete").and.returnValue(of({}));

      authService.logOut().then(() => {
        expect(spy).toHaveBeenCalledWith("/auth/sign_out");
      });
    }));

    it("clears the auth token", waitForAsync(() => {
      spyOn(apiGateway, "delete").and.returnValue(of({}));
      localStorage.setItem(AUTH_TOKEN_KEY, "token");

      authService.logOut().then(() => {
        expect(localStorage.getItem(AUTH_TOKEN_KEY)).toEqual(null);
      });
    }));

    it("still clears the auth token if the sign out request fails", waitForAsync(() => {
      spyOn(apiGateway, "delete").and.returnValue(throwError("failed"));
      localStorage.setItem(AUTH_TOKEN_KEY, "token");

      authService.logOut().then(() => {
        expect(localStorage.getItem(AUTH_TOKEN_KEY)).toEqual(null);
      });
    }));
  });

  describe("isLoggedIn()", () => {
    it("resolves to false without validating if there is no auth token", async () => {
      const spy = spyOn(apiGateway, "getOrThrow");

      expect(await authService.isLoggedIn()).toEqual(false);
      expect(spy).not.toHaveBeenCalled();
    });

    describe("with an auth token", () => {
      beforeEach(() => {
        localStorage.setItem(AUTH_TOKEN_KEY, "token");
      });

      it("validates the token against the server", async () => {
        const spy = spyOn(apiGateway, "getOrThrow").and.returnValue(
          of({ success: true, data: { email: "user@example.com" } })
        );

        expect(await authService.isLoggedIn()).toEqual(true);
        expect(spy).toHaveBeenCalledWith("/auth/validate");
      });

      it("caches a successful validation", async () => {
        const spy = spyOn(apiGateway, "getOrThrow").and.returnValue(
          of({ success: true })
        );

        expect(await authService.isLoggedIn()).toEqual(true);
        expect(await authService.isLoggedIn()).toEqual(true);
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it("shares one request between concurrent calls", async () => {
        const spy = spyOn(apiGateway, "getOrThrow").and.returnValue(
          of({ success: true })
        );

        const results = await Promise.all([
          authService.isLoggedIn(),
          authService.isLoggedIn()
        ]);

        expect(results).toEqual([true, true]);
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it("resolves to false and does not cache if success is not true", async () => {
        const spy = spyOn(apiGateway, "getOrThrow").and.returnValue(
          of({ success: false })
        );

        expect(await authService.isLoggedIn()).toEqual(false);
        expect(await authService.isLoggedIn()).toEqual(false);
        expect(spy).toHaveBeenCalledTimes(2);
      });

      it("clears the token and resolves to false on a 401", async () => {
        spyOn(apiGateway, "getOrThrow").and.returnValue(
          throwError({ status: 401 })
        );

        expect(await authService.isLoggedIn()).toEqual(false);
        expect(localStorage.getItem(AUTH_TOKEN_KEY)).toEqual(null);
      });

      it("does not cache a 401", async () => {
        const spy = spyOn(apiGateway, "getOrThrow").and.returnValue(
          throwError({ status: 401 })
        );
        localStorage.setItem(AUTH_TOKEN_KEY, "token");

        await authService.isLoggedIn();
        localStorage.setItem(AUTH_TOKEN_KEY, "new-token");
        await authService.isLoggedIn();

        expect(spy).toHaveBeenCalledTimes(2);
      });

      it("keeps the token and resolves to true on a non-401 error", async () => {
        spyOn(apiGateway, "getOrThrow").and.returnValue(
          throwError({ status: 500 })
        );

        expect(await authService.isLoggedIn()).toEqual(true);
        expect(localStorage.getItem(AUTH_TOKEN_KEY)).toEqual("token");
      });

      it("keeps the token and resolves to true on a network error", async () => {
        spyOn(apiGateway, "getOrThrow").and.returnValue(
          throwError({ status: 0 })
        );

        expect(await authService.isLoggedIn()).toEqual(true);
        expect(localStorage.getItem(AUTH_TOKEN_KEY)).toEqual("token");
      });

      it("does not cache a non-401 error", async () => {
        const spy = spyOn(apiGateway, "getOrThrow").and.returnValue(
          throwError({ status: 500 })
        );

        await authService.isLoggedIn();
        await authService.isLoggedIn();

        expect(spy).toHaveBeenCalledTimes(2);
      });
    });
  });
});
