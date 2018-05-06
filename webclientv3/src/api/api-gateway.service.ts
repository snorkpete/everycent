import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Headers, Http, RequestOptions, URLSearchParams } from "@angular/http";
import { Router } from "@angular/router";
import { BASE_URL } from "./base-url.service";
import { Observable } from "rxjs/Observable";
import { AuthCredentials } from "../app/core/auth/auth-credentials";
import { LoadingIndicator } from "../app/shared/loading-indicator/loading-indicator.service";

@Injectable()
export class ApiGateway {
  private BASE_URL = BASE_URL;
  constructor(
    private http: HttpClient,
    private router: Router,
    private loadingIndicator: LoadingIndicator
  ) {}

  get(url: string, params?: any): Observable<any> {
    const options = { headers: this.getAuthenticationHeaders() };
    const fullUrl = `${this.BASE_URL}${url}?${this.urlEncode(params)}`;

    this.loadingIndicator.show();
    return this.http
      .get(fullUrl, options)
      .do(() => this.loadingIndicator.hide())
      .catch(error => {
        // TODO: only catch authentication errors
        //       when doing this redirect
        this.router.navigateByUrl("/login");
        this.loadingIndicator.hide();
        return Observable.empty();
      });
  }

  post(url: string, data?: any): Observable<any> {
    const options = { headers: this.getAuthenticationHeaders() };
    const fullUrl = `${this.BASE_URL}${url}`;

    this.loadingIndicator.show();
    return this.http
      .post(fullUrl, data, options)
      .do(() => this.loadingIndicator.hide());
  }

  put(url: string, data?: any): Observable<any> {
    const options = { headers: this.getAuthenticationHeaders() };
    const fullUrl = `${this.BASE_URL}${url}`;

    this.loadingIndicator.show();
    return this.http
      .put(fullUrl, data, options)
      .do(() => this.loadingIndicator.hide());
  }

  postWithoutAuthentication(url: string, data: any): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });

    const fullUrl = `${this.BASE_URL}${url}`;

    this.loadingIndicator.show();
    return this.http
      .post(fullUrl, data, { headers: headers, observe: "response" })
      .do(() => this.loadingIndicator.hide())
      .map(response => {
        return {
          "access-token": response.headers.get("access-token"),
          client: response.headers.get("client"),
          expiry: response.headers.get("expiry"),
          "token-type": response.headers.get("token-type"),
          uid: response.headers.get("uid")
        };
      })
      .catch(errorRes => {
        console.log(errorRes);
        this.loadingIndicator.hide();
        let errorResponse = errorRes.error;
        return Observable.throw(errorResponse["errors"][0]);
      });
  }

  private getAuthenticationHeaders(): HttpHeaders {
    let headers = AuthCredentials.fromLocalStorage().toHeaders();
    // ensure that we receive responses as json
    // Note that headers is immutable - append returns a new HttpHeaders object
    return headers.append("Content-Type", "application/json");
  }

  private urlEncode(obj: any): string {
    let urlSearchParams = new URLSearchParams();
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        urlSearchParams.append(key, obj[key]);
      }
    }
    return urlSearchParams.toString();
  }
}
