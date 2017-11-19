import {AuthCredentials} from './auth-credentials';
import {Headers} from '@angular/http';

describe('AuthCredentials', () => {

  describe('#toJSON()', () => {

    it("converts to an object containing ALL the required properties", () => {
      let c = new AuthCredentials({
        'access-token': 'a',
        'client': 'c',
        'expiry': 'e',
        'token-type': 't',
        'uid': 'u'
      });
      expect(c.toJSON()).toEqual({
        'access-token': 'a',
        'client': 'c',
        'expiry': 'e',
        'token-type': 't',
        'uid': 'u'
      });

      let missing = new AuthCredentials({
        'access-token': 'ac'
      });

      expect(missing.toJSON()).toEqual({
        'access-token': 'ac',
        'client': null,
        'expiry': null,
        'token-type': null,
        'uid': null
      });
    });
  });

  describe('#toHeaders()', () => {

    it("converts to a Headers containing ALL the required properties", () => {
      let source = {
        'access-token': 'a',
        'client': 'c',
        'expiry': 'e',
        'token-type': 't',
        'uid': 'u'
      };

      let cred = new AuthCredentials(source);
      expect(cred.toHeaders().toJSON()).toEqual(new Headers(source).toJSON());
    });

  });

  describe('.fromLocalStorage()', () => {
    it("creates an AuthCredentials from the data in localStorage", () => {
      let source = {
        'access-token': 'access',
        'client': 'client',
        'expiry': 'expiry',
        'token-type': 'token',
        'uid': 'uid'
      };
      localStorage.clear();
      localStorage.setItem('access-token', source['access-token']);
      localStorage.setItem('client', source['client']);
      localStorage.setItem('expiry', source['expiry']);
      localStorage.setItem('token-type', source['token-type']);
      localStorage.setItem('uid', source['uid']);

      let credentials = AuthCredentials.fromLocalStorage();
      expect(credentials.toJSON()).toEqual(source);
    });
  });

  describe('#saveToLocalStorage()', () => {
    it("saves the auth data to local storage", () => {
      let source = {
        'access-token': 'access',
        'client': 'client',
        'expiry': 'expiry',
        'token-type': 'token',
        'uid': 'uid'
      };

      let credentials = new AuthCredentials(source);

      localStorage.clear();
      credentials.saveToLocalStorage();
      expect(localStorage.getItem('access-token')).toEqual(source['access-token']);
      expect(localStorage.getItem('client')).toEqual(source['client']);
      expect(localStorage.getItem('expiry')).toEqual(source['expiry']);
      expect(localStorage.getItem('token-type')).toEqual(source['token-type']);
      expect(localStorage.getItem('uid')).toEqual(source['uid']);
    });
  });


});
