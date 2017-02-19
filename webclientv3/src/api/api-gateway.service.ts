import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions, URLSearchParams} from '@angular/http';
import {BASE_URL} from './base-url.service';
import {Observable} from 'rxjs/Observable';
import {AuthCredentials} from '../app/shared/auth/auth-credentials';

@Injectable()
export class ApiGateway {

  private BASE_URL = BASE_URL;
  constructor(
    public http: Http
  ) {}

  get(url: string, params?: any): Observable<any> {

    const options = new RequestOptions({ headers: this.getAuthenticationHeaders() });
    const fullUrl = `${this.BASE_URL}/${url}?${this.urlEncode(params)}`;

    return this.http.get(fullUrl, options)
                    .map(res => res.json());
  }

  postWithoutAuthentication(url: string, data: any): Observable<any> {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const options = new RequestOptions({ headers: headers});
    return this.http.post(url, data, options)
                    .map( response => ({
                      'access-token': response.headers.get('access-token'),
                      'client': response.headers.get('client'),
                      'expiry': response.headers.get('expiry'),
                      'token-type': response.headers.get('token-type'),
                      'uid': response.headers.get('uid'),
                    }))
                    .catch( error => {
                      return Observable.throw(error.json());
                    });

  }

  private getAuthenticationHeaders() {
    let headers = AuthCredentials.fromLocalStorage().toHeaders();
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
