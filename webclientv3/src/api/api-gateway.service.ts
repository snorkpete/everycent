import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {BASE_URL} from "./base-url.service";

@Injectable()
export class ApiGateway{

  private BASE_URL = BASE_URL;
  constructor(
    private http: Http
  ) {}

  test() {
    this.http.get(this.BASE_URL + '/account_balances')
    //this.http.get('/api/account_balances')
      .map(res => res.json())
      .subscribe( result => console.log(result))
  }
}
