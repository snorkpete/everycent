import { HttpClient } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AUTH_TOKEN_KEY } from "../app/core/auth/auth-token";
import { LoginRedirect } from "../app/core/auth/login-redirect.service";
import { LoadingIndicator } from "../app/shared/loading-indicator/loading-indicator.service";
import { ApiGateway } from "./api-gateway.service";

describe("ApiGateway", () => {
  let apiGateway: ApiGateway;
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let loginRedirect: { toLogin: jasmine.Spy };

  // helper to make it easier to test against partial URLs
  function checkRequest(url: string): TestRequest {
    return httpTestingController.expectOne(request =>
      request.url.includes(url)
    );
  }

  beforeEach(() => {
    localStorage.clear();
    loginRedirect = { toLogin: jasmine.createSpy("toLogin") };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiGateway,
        LoadingIndicator,
        { provide: LoginRedirect, useValue: loginRedirect }
      ]
    });
  });

  beforeEach(() => {
    apiGateway = TestBed.inject(ApiGateway);
    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  describe("get()", () => {
    it("requests the correct url", () => {
      let url = "/accounts";
      let testData = [{ id: 1, name: "Account" }];
      apiGateway.get(url).subscribe(data => {
        expect(data).toEqual(testData);
      });

      // confirm that we're hitting the correct URL
      const req = checkRequest(url);
      req.flush(testData);
      httpTestingController.verify();
    });

    it("makes a 'GET' request", () => {
      apiGateway.get("hello").subscribe();
      const req = checkRequest("hello");
      expect(req.request.method).toEqual("GET");
    });

    it("converts the result to JSON", () => {
      let mockResponse = [
        { id: 0, name: "Account 0" },
        { id: 1, name: "Account 1" },
        { id: 2, name: "Account 2" },
        { id: 2, name: "Account 2" }
      ];

      apiGateway.get("random").subscribe(accounts => {
        expect(accounts.length).toEqual(4, "4 accounts returned");
      });

      const req = checkRequest("random");
      req.flush(mockResponse);
    });

    it("encodes its params as part of the URL", () => {
      apiGateway.get("hello", { name: "joe", last: "smith" }).subscribe();
      const req = checkRequest("hello");
      expect(req.request.url).toContain("hello?name=joe&last=smith");
    });

    it("adds the bearer token and content type headers", () => {
      localStorage.setItem(AUTH_TOKEN_KEY, "my-token");

      apiGateway.get("hello", { name: "joe", last: "smith" }).subscribe();

      const req = checkRequest("hello");
      expect(req.request.headers.get("Content-Type")).toEqual(
        "application/json",
        "content type matches"
      );
      expect(req.request.headers.get("Authorization")).toEqual(
        "Bearer my-token",
        "bearer token matches"
      );
    });

    it("sends no Authorization header when there is no token", () => {
      apiGateway.get("hello", { name: "joe", last: "smith" }).subscribe();

      const req = checkRequest("hello");
      expect(req.request.headers.has("Authorization")).toEqual(false);
    });

    describe("when the request fails", () => {
      it("redirects to login on a 401", () => {
        apiGateway.get("hello").subscribe();
        checkRequest("hello").flush("", {
          status: 401,
          statusText: "Unauthorized"
        });

        expect(loginRedirect.toLogin).toHaveBeenCalled();
      });

      it("does not redirect to login on other errors", () => {
        apiGateway.get("hello").subscribe();
        checkRequest("hello").flush("", {
          status: 500,
          statusText: "Server Error"
        });

        expect(loginRedirect.toLogin).not.toHaveBeenCalled();
      });
    });
  });

  describe("post()", () => {
    it("posts to the correct url", () => {
      let url = "accounts";
      let data = { first: "Hello", second: "World" };
      apiGateway.post(url, data).subscribe();
      const req = checkRequest(url);
      expect(req.request.url).toContain(url, "posts to the correct url");
      expect(req.request.body).toEqual(
        data,
        "posts the data as the body of the request"
      );
    });

    it("makes a 'POST' request", () => {
      apiGateway.post("hello").subscribe();
      const req = checkRequest("hello");
      expect(req.request.method).toEqual("POST");
    });

    it("converts the result to JSON", () => {
      let mockResponse = [
        { id: 0, name: "Account 0" },
        { id: 1, name: "Account 1" },
        { id: 2, name: "Account 2" },
        { id: 2, name: "Account 2" }
      ];

      apiGateway.post("random").subscribe((accounts: any) => {
        expect(accounts.length).toEqual(4, "4 accounts returned");
      });
      let req = checkRequest("random");
      req.flush(mockResponse);
    });

    it("adds the bearer token and content type headers", () => {
      localStorage.setItem(AUTH_TOKEN_KEY, "my-token");

      apiGateway.post("hello", { name: "joe", last: "smith" }).subscribe();

      const req = checkRequest("hello");
      expect(req.request.headers.get("Content-Type")).toEqual(
        "application/json",
        "content type matches"
      );
      expect(req.request.headers.get("Authorization")).toEqual(
        "Bearer my-token",
        "bearer token matches"
      );
    });

    it("sends no Authorization header when there is no token", () => {
      apiGateway.post("hello", { name: "joe", last: "smith" }).subscribe();

      const req = checkRequest("hello");
      expect(req.request.headers.has("Authorization")).toEqual(false);
    });
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
