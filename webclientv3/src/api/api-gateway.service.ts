import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {BASE_URL} from "./base-url.service";
import {Observable} from 'rxjs';

@Injectable()
export class ApiGateway {

  private BASE_URL = BASE_URL;
  constructor(
    private http: Http
  ) {}

  get(): Observable<any> {

    return this.http.get(this.BASE_URL + '/account_balances')
               .map(res => res.json());
  }
}
