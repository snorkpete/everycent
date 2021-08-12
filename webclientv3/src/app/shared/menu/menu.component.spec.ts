/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';

import { MenuComponent } from './menu.component';
import {RouterStub} from '../../../../test/stub-services/router-stub';
import {Router} from '@angular/router';
import {AuthService} from '../../core/auth/auth.service';
import {ApiGatewayStub} from '../../../../test/stub-services/api-gateway-stub';
import {ApiGateway} from '../../../api/api-gateway.service';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: RouterStub },
        AuthService,
        { provide: ApiGateway, useValue: ApiGatewayStub },
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
