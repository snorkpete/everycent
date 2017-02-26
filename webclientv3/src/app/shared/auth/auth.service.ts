import { Injectable } from '@angular/core';
import {ApiGateway} from '../../../api/api-gateway.service';
import {Observable} from 'rxjs/Observable';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import {AuthCredentials} from './auth-credentials';

@Injectable()
export class AuthService {

  private loggedIn = false;

  constructor(
    private apiGateway: ApiGateway
  ) { }

  logIn(email: string, password: string): Promise<any> {
    return this.apiGateway
            .postWithoutAuthentication('/auth/sign_in', {email, password})
            .do(userCredentials => {
              this.loggedIn = true;
              this.saveCredentials(userCredentials);
            })
            .catch(error => {
              // On any error, clear the credentials and rethrow the error
              this.clearCredentials();
              return Observable.throw(error);
            })
            .toPromise();
  }

  logOut(): Promise<any> {
    this.clearCredentials();
    return Promise.resolve(true);
  }

  /**
   *
   * @returns Promise<boolean> that resolves to true or false depending on logged in status
   */
  isLoggedIn(): Promise<boolean> {
    if (this.loggedIn) {
      return Promise.resolve(true);
    }

    let authCredentials = AuthCredentials.fromLocalStorage();
    if (!authCredentials.hasAccessToken()) {
      this.loggedIn = false;
      return Promise.resolve(false);
    }

    return this.apiGateway.get('/auth/validate_token')
      .map(result => result.success)
      .do(() => this.loggedIn = true)
      .catch(() => {
        this.loggedIn = false;
        return Observable.throw(false);
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

