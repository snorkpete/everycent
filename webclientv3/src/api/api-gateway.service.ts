import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { empty, Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { getAuthToken } from "../app/core/auth/auth-token";
import { LoginRedirect } from "../app/core/auth/login-redirect.service";
import { LoadingIndicator } from "../app/shared/loading-indicator/loading-indicator.service";
import { BASE_URL } from "./base-url.service";

@Injectable()
export class ApiGateway {
  private BASE_URL = BASE_URL;
  constructor(
    private http: HttpClient,
    private loginRedirect: LoginRedirect,
    private loadingIndicator: LoadingIndicator
  ) {}

  get(url: string, params?: any): Observable<any> {
    const options = { headers: this.getAuthenticationHeaders() };
    const fullUrl = `${this.BASE_URL}${url}?${this.urlEncode(params)}`;

    this.loadingIndicator.show();
    return this.http.get(fullUrl, options).pipe(
      tap(() => this.loadingIndicator.hide()),
      catchError(error => {
        this.loadingIndicator.hide();
        if (error.status === 401) {
          this.loginRedirect.toLogin();
        }
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

  private getAuthenticationHeaders(): HttpHeaders {
    // ensure that we receive responses as json
    let headers = new HttpHeaders({ "Content-Type": "application/json" });
    // Note that headers is immutable - set returns a new HttpHeaders object
    const token = getAuthToken();
    if (token !== null) {
      headers = headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
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
