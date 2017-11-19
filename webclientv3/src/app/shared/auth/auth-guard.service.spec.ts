/* tslint:disable:no-unused-variable */

import {AuthGuard} from './auth-guard.service';
import {AuthService} from './auth.service';
import {ApiGatewayStub} from '../../../../test/api-gateway-stub';
import {ApiGateway} from '../../../api/api-gateway.service';

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
