import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { empty, Observable, throwError as observableThrowError } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { AuthCredentials } from "../app/core/auth/auth-credentials";
import { LoadingIndicator } from "../app/shared/loading-indicator/loading-indicator.service";
import { BASE_URL } from "./base-url.service";

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
    return this.http.get(fullUrl, options).pipe(
      tap(() => this.loadingIndicator.hide()),
      catchError(error => {
        // TODO: only catch authentication errors
        //       when doing this redirect
        this.router.navigateByUrl("/login");
        this.loadingIndicator.hide();
        return empty();
      })
    );
  }

  post(url: string, data?: any): Observable<any> {
    const options = { headers: this.getAuthenticationHeaders() };
    const fullUrl = `${this.BASE_URL}${url}`;

    this.loadingIndicator.show();
    return this.http
      .post(fullUrl, data, options)
      .pipe(tap(() => this.loadingIndicator.hide()));
  }

  put(url: string, data?: any): Observable<any> {
    const options = { headers: this.getAuthenticationHeaders() };
    const fullUrl = `${this.BASE_URL}${url}`;

    this.loadingIndicator.show();
    return this.http
      .put(fullUrl, data, options)
      .pipe(tap(() => this.loadingIndicator.hide()));
  }

  delete(url: string): Observable<any> {
    const options = { headers: this.getAuthenticationHeaders() };
    const fullUrl = `${this.BASE_URL}${url}`;

    this.loadingIndicator.show();
    return this.http
      .delete(fullUrl, options)
      .pipe(tap(() => this.loadingIndicator.hide()));
  }

  postWithoutAuthentication(url: string, data: any): Observable<any> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });

    const fullUrl = `${this.BASE_URL}${url}`;

    this.loadingIndicator.show();
    return this.http
      .post(fullUrl, data, { headers: headers, observe: "response" })
      .pipe(
        tap(() => this.loadingIndicator.hide()),
        map(response => {
          return {
            "access-token": response.headers.get("access-token"),
            client: response.headers.get("client"),
            expiry: response.headers.get("expiry"),
            "token-type": response.headers.get("token-type"),
            uid: response.headers.get("uid")
          };
        }),
        catchError(errorRes => {
          console.log(errorRes);
          this.loadingIndicator.hide();
          let errorResponse = errorRes.error;
          return observableThrowError(errorResponse["errors"][0]);
        })
      );
  }

  private getAuthenticationHeaders(): HttpHeaders {
    let headers = AuthCredentials.fromLocalStorage().toHeaders();
    // ensure that we receive responses as json
    // Note that headers is immutable - append returns a new HttpHeaders object
    return headers.append("Content-Type", "application/json");
  }

  private urlEncode(obj: any = {}): string {
    let params = new HttpParams();
    Object.entries(obj).forEach(entry => {
      let key: string, value: any;
      [key, value] = entry;
      params = params.append(key, value);
    });
    return params.toString();
  }
}
