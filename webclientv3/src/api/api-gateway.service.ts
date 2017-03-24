import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions, URLSearchParams} from '@angular/http';
import {BASE_URL} from './base-url.service';
import {Observable} from 'rxjs/Observable';
import {AuthCredentials} from '../app/shared/auth/auth-credentials';
import 'rxjs/add/observable/throw';
import {LoadingIndicator} from '../app/shared/loading-indicator/loading-indicator.service';

@Injectable()
export class ApiGateway {

  private BASE_URL = BASE_URL;
  constructor(
    public http: Http,
    private loadingIndicator: LoadingIndicator
  ) {}

  get(url: string, params?: any): Observable<any> {

    const options = new RequestOptions({ headers: this.getAuthenticationHeaders() });
    const fullUrl = `${this.BASE_URL}${url}?${this.urlEncode(params)}`;

    this.loadingIndicator.show();
    return this.http.get(fullUrl, options)
                    .do(() => this.loadingIndicator.hide())
                    .map(res => res.json());
    // TODO: catch authentication errors and redirect to the login page

  }

  post(url: string, data?: any): Observable<any> {
    const options = new RequestOptions({ headers: this.getAuthenticationHeaders() });
    const fullUrl = `${this.BASE_URL}${url}`;

    this.loadingIndicator.show();
    return this.http.post(fullUrl, data, options)
      .do(() => this.loadingIndicator.hide())
      .map(res => res.json());
  }

  put(url: string, data?: any): Observable<any> {
    const options = new RequestOptions({ headers: this.getAuthenticationHeaders() });
    const fullUrl = `${this.BASE_URL}${url}`;

    this.loadingIndicator.show();
    return this.http.put(fullUrl, data, options)
                    .do(() => this.loadingIndicator.hide())
                    .map(res => res.json());
  }

  postWithoutAuthentication(url: string, data: any): Observable<any> {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    const options = new RequestOptions({ headers: headers});

    const fullUrl = `${this.BASE_URL}${url}`;

    this.loadingIndicator.show();
    return this.http.post(fullUrl, data, options)
                    .do(() => this.loadingIndicator.hide())
                    .map( response => {
                      return {
                        'access-token': response.headers.get('access-token'),
                        'client': response.headers.get('client'),
                        'expiry': response.headers.get('expiry'),
                        'token-type': response.headers.get('token-type'),
                        'uid': response.headers.get('uid'),
                      };
                    })
                    .catch( error => {
                      this.loadingIndicator.hide();
                      let errorResponse = error.json();
                      return Observable.throw(errorResponse["errors"][0]);
                    });

  }

  private getAuthenticationHeaders() {
    let headers = AuthCredentials.fromLocalStorage().toHeaders();
    // ensure that we receive responses as json
    headers.append('Content-Type', 'application/json');
    return headers;
  }

  private urlEncode(obj: any): string {
    let urlSearchParams = new URLSearchParams();
    for (let key in obj) {
      urlSearchParams.append(key, obj[key]);
    }
    return urlSearchParams.toString();
  }
}
