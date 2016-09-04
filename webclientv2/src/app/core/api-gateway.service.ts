import { Injectable } from '@angular/core';
import {Http, Headers, RequestOptions, URLSearchParams} from "@angular/http";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import {Observable, BehaviorSubject} from "rxjs/Rx";

@Injectable()
export class ApiGateway {

  constructor(
    private http: Http
  ) {
  }


  get(url:string, data: any = {}): Observable<any>{

    let options = new RequestOptions({
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: ""
    });

    let standardParams = { };
    let allParams = Object.assign(standardParams, data);
    let urlEncodedParams = ApiGateway.urlEncode(allParams);

    return this.http
      .get(`${url}?${urlEncodedParams}`, options)
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
