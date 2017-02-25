import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {MessageService} from '../../message-display/message.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private messageService: MessageService
  ) { }

  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // TODO: to implement
    //this.messageService.setErrorMessage('You are not logged in');
    return true;
  }
}
