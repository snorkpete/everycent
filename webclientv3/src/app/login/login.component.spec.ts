/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NO_ERRORS_SCHEMA} from '@angular/core';

import {LoginComponent} from './login.component';
import {MainToolbarService} from '../shared/main-toolbar/main-toolbar.service';
import {AuthService} from '../core/auth/auth.service';
import {FormsModule} from '@angular/forms';
import {ApiGateway} from '../../api/api-gateway.service';
import {ApiGatewayStub} from '../../../test/api-gateway-stub';
import {MessageService} from '../message-display/message.service';
import {Router} from '@angular/router';
import {RouterStub} from '../../../test/router-stub';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let messageService: MessageService;
  let router: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
      ],
      declarations: [ LoginComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        MainToolbarService,
        AuthService,
        MessageService,
        { provide: ApiGateway, useValue: ApiGatewayStub },
        { provide: Router, useValue: RouterStub },
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(inject([AuthService, MessageService, Router], (_authService, _messageService, _router) => {
    authService = _authService;
    messageService = _messageService;
    router = _router;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('calls AuthService#login when the Log In button is clicked', async(() => {
    let spy = spyOn(authService, 'logIn').and.returnValue(Promise.resolve({}));

    component.email = 'myemail';
    component.password = 'pass';

    let loginButton = fixture.debugElement.query(By.css('.login'));
    loginButton.nativeElement.click();

      expect(spy.calls.any()).toBeTruthy('calls authService#login');
      expect(spy.calls.mostRecent().args[0]).toEqual('myemail');
      expect(spy.calls.mostRecent().args[1]).toEqual('pass');
  }));

  it('navigates to the "home" route when login is successful', async(() => {
    spyOn(authService, 'logIn').and.returnValue(Promise.resolve('success'));

    component.login().then(() => {
      expect(router.navigatedTo).toEqual('/', 'route to home route');
    });
  }));

  it('shows the error from AuthService if one is returned', async(() => {
    spyOn(authService, 'logIn').and.returnValue(Promise.reject({errors: ['Bad']}));

    component.login().catch((error) => {
      expect(messageService.getMessage()).toEqual(error);
    });
  }));

  it('clears the form when the Reset button is clicked', () => { pending(); });
});

