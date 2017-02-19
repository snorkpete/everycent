/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';

import { LoginComponent } from './login.component';
import {MaterialModule} from '@angular/material';
import {MainToolbarService} from '../shared/main-toolbar/main-toolbar.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // importing this module slows down tests dramatically
        //MaterialModule.forRoot(),
      ],
      declarations: [ LoginComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        MainToolbarService,
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('calls AuthService#login when the Log In button is clicked', () => {pending();});
  it('shows the error from AuthService if one is returned', () => {pending();});

  it('clears the form when the Reset button is clicked', () => {pending();});
});
