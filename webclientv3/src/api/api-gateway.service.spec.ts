import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest
} from "@angular/common/http/testing";
import { async, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterStub } from "../../test/stub-services/router-stub";
import { LoadingIndicator } from "../app/shared/loading-indicator/loading-indicator.service";
import { ApiGateway } from "./api-gateway.service";

describe("ApiGateway", () => {
  let apiGateway: ApiGateway;
  let http: HttpClient;
  let httpTestingController: HttpTestingController;

  // helper to make it easier to test against partial URLs
  function checkRequest(url: string): TestRequest {
    return httpTestingController.expectOne(request =>
      request.url.includes(url)
    );
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiGateway,
        LoadingIndicator,
        { provide: Router, useValue: RouterStub }
      ]
    });
  });

  beforeEach(() => {
    apiGateway = TestBed.get(ApiGateway);
    http = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
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

    it("adds the correct authentication headers", () => {
      // setup the local storage
      // Authentication header values should pull from here
      localStorage.setItem("access-token", "access");
      localStorage.setItem("client", "client");
      localStorage.setItem("expiry", "expiry");
      localStorage.setItem("token-type", "token");
      localStorage.setItem("uid", "uid");

      apiGateway.get("hello", { name: "joe", last: "smith" }).subscribe();

      const req = checkRequest("hello");
      expect(req.request.headers.get("Content-Type")).toEqual(
        "application/json",
        "content type matches"
      );
      expect(req.request.headers.get("access-token")).toEqual(
        "access",
        "access token matches"
      );
      expect(req.request.headers.get("client")).toEqual(
        "client",
        "client matches"
      );
      expect(req.request.headers.get("expiry")).toEqual(
        "expiry",
        "expiry matches"
      );
      expect(req.request.headers.get("token-type")).toEqual(
        "token",
        "token type matches"
      );
      expect(req.request.headers.get("uid")).toEqual("uid", "uid matches");
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

    it("adds the correct authentication headers", () => {
      // setup the local storage
      // Authentication header values should pull from here
      localStorage.setItem("access-token", "access");
      localStorage.setItem("client", "client");
      localStorage.setItem("expiry", "expiry");
      localStorage.setItem("token-type", "token");
      localStorage.setItem("uid", "uid");

      apiGateway.post("hello", { name: "joe", last: "smith" }).subscribe();

      const req = checkRequest("hello");
      expect(req.request.headers.get("Content-Type")).toEqual(
        "application/json",
        "content type matches"
      );
      expect(req.request.headers.get("access-token")).toEqual(
        "access",
        "access token matches"
      );
      expect(req.request.headers.get("client")).toEqual(
        "client",
        "client matches"
      );
      expect(req.request.headers.get("expiry")).toEqual(
        "expiry",
        "expiry matches"
      );
      expect(req.request.headers.get("token-type")).toEqual(
        "token",
        "token type matches"
      );
      expect(req.request.headers.get("uid")).toEqual("uid", "uid matches");
    });
  });

  describe("postWithoutAuthentication()", () => {
    it("POSTs to the correct url", () => {
      let url = "/login";
      apiGateway.postWithoutAuthentication(url, {}).subscribe();
      const req = checkRequest(url);
      expect(req.request.url).toContain(url, "uses correct url");
      expect(req.request.method).toEqual("POST", "uses correct method");
    });

    it("adds additional data to the request body", () => {
      apiGateway
        .postWithoutAuthentication("test", {
          mydata: "yes",
          name: "Jess"
        })
        .subscribe();

      const req = checkRequest("test");
      expect(req.request.body).toEqual({ mydata: "yes", name: "Jess" });
    });

    it("does NOT add any authentication headers", () => {
      apiGateway.postWithoutAuthentication("test", {}).subscribe();
      const req = checkRequest("test");
      expect(req.request.headers.get("Content-Type")).toEqual(
        "application/json",
        "has correct content type"
      );
      expect(req.request.headers.get("access-token")).toEqual(
        null,
        "no access token"
      );
    });

    it(
      "sends the authentication response headers as the output on success",
      async(() => {
        apiGateway.postWithoutAuthentication("test", {}).subscribe(result => {
          expect(result["access-token"]).toEqual("a");
          expect(result["client"]).toEqual("c");
          expect(result["expiry"]).toEqual("e");
          expect(result["token-type"]).toEqual("t");
          expect(result["uid"]).toEqual("u");
        });

        let headers = new HttpHeaders({
          "access-token": "a",
          client: "c",
          expiry: "e",
          "token-type": "t",
          uid: "u"
        });

        const req = checkRequest("test");
        req.flush("", { headers: headers });
      })
    );

    it(
      "sends the error message as the response if the request fails",
      async(() => {
        let errorJSON = { errors: ["Authentication failed"] };
        apiGateway.postWithoutAuthentication("test", {}).subscribe({
          error: error => {
            expect(error).toEqual("Authentication failed");
          }
        });

        const req = checkRequest("test");
        req.flush(errorJSON, {
          status: 401,
          statusText: "Authentication Failed"
        });
      })
    );
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
