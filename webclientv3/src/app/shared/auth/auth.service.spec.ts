/* tslint:disable:no-unused-variable */

import {inject, TestBed} from '@angular/core/testing';
import {AuthService} from './auth.service';
import {ApiGateway} from '../../../api/api-gateway.service';
import {Observable} from 'rxjs/Observable';
import 'hammerjs';
import {Http} from '@angular/http';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';

describe('AuthService', () => {

  let authService: AuthService;
  let apiGateway: ApiGateway;

  let httpStub = {
    get: (_: any) => {},
    post: (_: any) => {},
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        //MaterialModule.forRoot()
      ],
      providers: [
        AuthService,
        ApiGateway,
        { provide: Http, useValue: httpStub }
      ]
    });
  });

  beforeEach(inject([AuthService, ApiGateway], (service: AuthService, gateway: ApiGateway) => {
      authService = service;
      apiGateway = gateway;
  }));

  describe("logIn()", () => {

    it('calls apiGateway with the correct parameters', () => {
      let spy = spyOn(apiGateway, 'postWithoutAuthentication').and.returnValue(Observable.of({}));

      const email = 'email';
      const password = 'password';

      authService.logIn(email, password).then(() => {
        expect(spy.calls.mostRecent().args[0]).toEqual('/login', 'calls to the correct url');
        expect(spy.calls.mostRecent().args[1]).toEqual({email, password}, 'passes the email and password properly');
      });
    });

    it("resolves to the user on successful login", () => {
      let userCredentials = { token: 'token' };
      spyOn(apiGateway, 'postWithoutAuthentication').and.returnValue(Observable.of(userCredentials));

      authService.logIn('good@email', 'password').then((result: any) => {
        expect(result).toEqual(userCredentials);
      });
    });

    it('rejects with an error message on login failure', () => {
      let errorMessage = 'Invalid credentials';
      spyOn(apiGateway, 'postWithoutAuthentication').and.returnValue(Observable.throw(errorMessage));

      authService.logIn('good@email', 'password').catch((result: any) => {
        expect(result).toEqual(errorMessage);
      });

    });

    it('on success saves the authentication info to local storage', () => {
      let userCredentials = {
        'access-token': 'access',
        'client': 'client',
        'expiry': 'noexpiry',
        'token-type': 'myTokenType',
        'uid': 'myUid'
      };
      spyOn(apiGateway, 'postWithoutAuthentication').and.returnValue(Observable.of(userCredentials));

      localStorage.clear();
      authService.logIn('', '').then(() => {
        expect(localStorage.getItem('access-token')).toEqual('access');
        expect(localStorage.getItem('client')).toEqual('client');
        expect(localStorage.getItem('expiry')).toEqual('noexpiry');
        expect(localStorage.getItem('token-type')).toEqual('myTokenType');
        expect(localStorage.getItem('uid')).toEqual('myUid');
      });
    });

    it('if the gateway returns false, does not save any authentication info', () => {

      spyOn(apiGateway, 'postWithoutAuthentication').and.returnValue(Observable.throw('invalid'));

      localStorage.setItem('access-token', 'boo');
      authService.logIn('', '').catch(() => {
        expect(localStorage.getItem('access-token')).toEqual(null);
        expect(localStorage.getItem('client')).toEqual(null);
        expect(localStorage.getItem('expiry')).toEqual(null);
        expect(localStorage.getItem('token-type')).toEqual(null);
        expect(localStorage.getItem('uid')).toEqual(null);
      });
    });
  });

  describe("logOut()", () => {
    it('clears the authentication info in local storage', () => {});
    it('redirects (or submits an event to redirect) to the login page', () => {});
  });

  describe("isLoggedIn()", () => {
    it('returns true after successful login', () => {});
    it('returns false after logout', () => {});
  });
});
