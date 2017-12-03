/* tslint:disable:no-unused-variable */

import {AuthGuard} from './auth-guard.service';
import {ApiGatewayStub} from "../../../../test/stub-services/api-gateway-stub";
import {AuthService} from './auth.service';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(ApiGatewayStub as any);
    //authGuard = new AuthGuard();
  });

  describe('#canActivate', () => {
    it('returns true if authService.isLoggedIn()', () => {
      pending();
      //spyOn(authService, 'isLoggedIn').and.returnValue(true);
      //expect(authGuard.canActivate()).toBeDefined();
    });
  });

});
