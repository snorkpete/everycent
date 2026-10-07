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
    it("resolves to false if there is no auth token", waitForAsync(() => {
      authService.isLoggedIn().then(isLoggedIn => {
        expect(isLoggedIn).toEqual(false);
      });
    }));

    it("resolves to true if there is an auth token", waitForAsync(() => {
      localStorage.setItem(AUTH_TOKEN_KEY, "token");

      authService.isLoggedIn().then(isLoggedIn => {
        expect(isLoggedIn).toEqual(true);
      });
    }));
  });
});
