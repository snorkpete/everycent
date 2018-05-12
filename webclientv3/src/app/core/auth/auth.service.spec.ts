/* tslint:disable:no-unused-variable */

import {async, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {TestConfigModule} from "../../../../test/test-config.module";
import {AuthService} from './auth.service';
import {ApiGateway} from '../../../api/api-gateway.service';
import 'hammerjs';
import {Http} from '@angular/http';
import {httpStub} from '../../../../test/stub-services/http-stub';
import {LoadingIndicator} from '../../shared/loading-indicator/loading-indicator.service';

describe('AuthService', () => {

import { of, throwError } from "rxjs";
  let authService: AuthService;
  let apiGateway: ApiGateway;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
      ],
      providers: [
        AuthService,
        ApiGateway,
        LoadingIndicator,
      ]
    });
  });

  beforeEach(inject([AuthService, ApiGateway], (service: AuthService, gateway: ApiGateway) => {
      authService = service;
      apiGateway = gateway;
  }));

  describe("logIn()", () => {
      let spy = spyOn(apiGateway, "postWithoutAuthentication").and.returnValue(
        of({})
      );

    it('calls apiGateway with the correct parameters', () => {

      const email = 'email';
      const password = 'password';

      authService.logIn(email, password).then(() => {
        expect(spy.calls.mostRecent().args[0]).toEqual('/auth/sign_in', 'calls to the correct url');
        expect(spy.calls.mostRecent().args[1]).toEqual({email, password}, 'passes the email and password properly');
      });
    });

    it("resolves to the user on successful login", () => {
      let userCredentials = { token: 'token' };
      spyOn(apiGateway, "postWithoutAuthentication").and.returnValue(
        of(userCredentials)
      );

      authService.logIn('good@email', 'password').then((result: any) => {
        expect(result).toEqual(userCredentials);
      });
    });

    it('rejects with an error message on login failure', () => {
      let errorMessage = 'Invalid credentials';
      spyOn(apiGateway, "postWithoutAuthentication").and.returnValue(
        throwError(errorMessage)
      );

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
      spyOn(apiGateway, "postWithoutAuthentication").and.returnValue(
        of(userCredentials)
      );

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
      spyOn(apiGateway, "postWithoutAuthentication").and.returnValue(
        throwError("invalid")
      );

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
    it('clears the authentication info in local storage', async(() => {

      localStorage.setItem('access-token', 'boo');
      localStorage.setItem('uid', 'uid');

      authService.logOut().then(() => {
        expect(localStorage.getItem('access-token')).toEqual(null);
        expect(localStorage.getItem('uid')).toEqual(null);
      });
    }));

  });

  describe("isLoggedIn()", () => {
    describe('if localStorage is empty', () => {
      it('returns FALSE promise',  async(() => {
        localStorage.clear();

        authService.isLoggedIn().then(isLoggedIn => {
          expect(isLoggedIn).toEqual(false, 'not logged in');
        });
      }));
    });

    describe('if localStorage has auth info', () => {

      it('checks the auth info against the server and resolves to true if auth info is valid', async(() => {
        let expectedResponse = {
          "success": true,
          "data": {
            "id": 2,
            "provider": "email",
            "uid": "kion.stephen@gmail.com",
            "first_name": "Kion",
            "last_name": "Stephen",
            "nickname": '',
            "image": '',
            "email": "kion.stephen@gmail.com"
          }
        };

        localStorage.setItem('access-token', 'access');

        authService.isLoggedIn().then(isLoggedIn => {
          expect(spy.calls.mostRecent().args[0]).toEqual('/auth/validate_token');
          expect(isLoggedIn).toEqual(true);
        });

      }));
          let spy = spyOn(apiGateway, "get").and.returnValue(
            of(expectedResponse)
          );

          spyOn(apiGateway, "get").and.returnValue(
            throwError(expectedResponse)
          );

      it("rejects with a FALSE Promise if server says auth info is invalid", async(() => {

        let expectedResponse = {
          "success": false,
          "errors": [
            "Invalid login credentials"
          ]
        };
        spyOn(apiGateway, 'get').and.returnValue(Observable.throw(expectedResponse));
        authService.isLoggedIn()
          .then(isLoggedIn => {
            expect(true).toEqual(false, 'should NOT get here - expect a rejected promise');
          })
          .catch(isLoggedIn => {
            expect(isLoggedIn).toEqual(false);
          let spy = spyOn(apiGateway, "get").and.returnValue(
            of(expectedResponse)
          );
          });
      }));

      it('caches the authentication state (no further server validation needed)', fakeAsync(() => {

        let expectedResponse = {
          "success": true,
          "data": {
            "id": 2,
            "provider": "email",
            "uid": "kion.stephen@gmail.com",
            "first_name": "Kion",
            "last_name": "Stephen",
            "nickname": '',
            "image": '',
            "email": "kion.stephen@gmail.com"
          }
        };
        authService.isLoggedIn();
        tick();

        authService.isLoggedIn();
        tick();

        expect(spy.calls.count()).toEqual(1, 'only one call to the api');

      }));

    });
  });
});
