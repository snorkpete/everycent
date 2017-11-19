import {Headers} from '@angular/http';
export class AuthCredentials {

  // needed to be able to index into AuthCredentials without getting type errors
  //  (i.e.  this['access-token'] throws error without the index signature line below
  [key: string]: any;

  static fromLocalStorage(): AuthCredentials {
    return new AuthCredentials({
      'access-token': localStorage.getItem('access-token'),
      'client': localStorage.getItem('client'),
      'expiry': localStorage.getItem('expiry'),
      'token-type': localStorage.getItem('token-type'),
      'uid': localStorage.getItem('uid'),
    });
  }

  constructor(authData: any) {
    this['access-token'] = authData['access-token'];
    this['client'] = authData['client'];
    this['expiry'] = authData['expiry'];
    this['token-type'] = authData['token-type'];
    this['uid'] = authData['uid'];
  }

  hasAccessToken(): boolean {
    return !!this['access-token'];
  }

  toJSON(): any {
    return {
      'access-token': this['access-token'] || null,
      'client': this['client'] || null,
      'expiry': this['expiry'] || null,
      'token-type': this['token-type'] || null,
      'uid': this['uid'] || null
    };
  }

  toHeaders(): Headers {
    return new Headers(this.toJSON());
  }

  saveToLocalStorage(): void {
    localStorage.setItem('access-token', this['access-token']);
    localStorage.setItem('client', this['client']);
    localStorage.setItem('expiry', this['expiry']);
    localStorage.setItem('token-type', this['token-type']);
    localStorage.setItem('uid', this['uid']);
  }

}
