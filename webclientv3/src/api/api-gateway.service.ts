import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions, URLSearchParams} from '@angular/http';
import {BASE_URL} from "./base-url.service";
import {Observable} from 'rxjs/Observable';

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

  private getAuthenticationHeaders() {
    return new Headers({
      'Content-Type': 'application/json',
      'access-token': localStorage.getItem('access-token'),
      'client': localStorage.getItem('client'),
      'expiry': localStorage.getItem('expiry'),
      'token-type': localStorage.getItem('token-type'),
      'uid': localStorage.getItem('uid')
    });
  }

  private urlEncode(obj: Object): string {
    let urlSearchParams = new URLSearchParams();
    for (let key in obj) {
      urlSearchParams.append(key, obj[key]);
    }
    return urlSearchParams.toString();
  }
}
