import { Injectable } from '@angular/core';
import {Http, Headers, RequestOptions, URLSearchParams, Response} from "@angular/http";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {AuthService} from "../auth/auth.service";

@Injectable()
export class ApiGateway {

  constructor(
    private http: Http,
    private authService: AuthService
  ) {
  }

  private getHeaders(){
    return new Headers({
      'Content-Type': 'application/json',
      'access-token': localStorage.getItem('accessToken'),
      'client': localStorage.getItem('client'),
      'expiry': localStorage.getItem('expiry'),
      'token-type': localStorage.getItem('tokenType'),
      'uid': localStorage.getItem('uid')
    });
  }

  get(url:string, data: any = {}): Observable<any>{

    let options = new RequestOptions({
      headers: this.getHeaders(),
      body: ""
    });

    let standardParams = { };
    let allParams = Object.assign(standardParams, data);
    let urlEncodedParams = ApiGateway.urlEncode(allParams);

    return this.http
      .get(`${url}?${urlEncodedParams}`, options)
      .do((response: Response) => {
        if(response.status == 401){
          this.authService.logout('You have been logged out. Please log in again.');
          throw new Error('not logged in');
        }

        //localStorage.setItem('expiry', response.headers.get('expiry'));
        //localStorage.setItem('accessToken', response.headers.get('access-token'));
      })
      .map(response => response.json())
  }

  post(url: string, data: any = {}) :Observable<any>{

    let options = new RequestOptions({
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: ""
    });
    return this.http.post(url, data, options);
  }

  private static urlEncode(obj: Object): string {
    let urlSearchParams = new URLSearchParams();
    for (let key in obj) {
      urlSearchParams.append(key, obj[key]);
    }
    return urlSearchParams.toString();
  }
}
