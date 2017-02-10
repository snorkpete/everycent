import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {BASE_URL} from "./base-url.service";
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ApiGateway {

  private BASE_URL = BASE_URL;
  constructor(
    public http: Http
  ) {}

  get(url: string, params?: any): Observable<any> {

    return this.http.get(this.BASE_URL + '/' + url)
               .map(res => res.json());
  }
}
