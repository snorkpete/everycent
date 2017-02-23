import { Injectable } from '@angular/core';
import {ApiGateway} from '../../../api/api-gateway.service';
import {Observable} from 'rxjs/Observable';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

@Injectable()
export class AuthService {

  constructor(
    private apiGateway: ApiGateway
  ) { }

  logIn(email: string, password: string): Promise<any> {
    return this.apiGateway
            .postWithoutAuthentication('/auth/sign_in', {email, password})
            .do(userCredentials => this.saveCredentials(userCredentials))
            // On any error, clear the credentials and rethrow the error
            .catch(error => {
              this.clearCredentials();
              return Observable.throw(error);
            })
            .toPromise();
  }

  private saveCredentials(userCredentials: any): void {
    localStorage.setItem('access-token', userCredentials['access-token']);
    localStorage.setItem('client', userCredentials['client']);
    localStorage.setItem('expiry', userCredentials['expiry']);
    localStorage.setItem('token-type', userCredentials['token-type']);
    localStorage.setItem('uid', userCredentials['uid']);
  }

  private clearCredentials(): void {
    localStorage.removeItem('access-token');
    localStorage.removeItem('client');
    localStorage.removeItem('expiry');
    localStorage.removeItem('token-type');
    localStorage.removeItem('uid');
  }
}

