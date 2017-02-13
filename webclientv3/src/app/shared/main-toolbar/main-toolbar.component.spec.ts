/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MainToolbarComponent } from './main-toolbar.component';
import {SharedModule} from '../shared.module';
import {MaterialModule} from '@angular/material';
import {MainToolbarService} from './main-toolbar.service';

describe('MainToolbarComponent', () => {
  let component: MainToolbarComponent;
  let fixture: ComponentFixture<MainToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule.forRoot()],
      declarations: [ MainToolbarComponent ],
      providers: [
        MainToolbarService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has an "open sidebar" button', async(() => {
    let button = fixture.debugElement.query(By.css('.open-menu-button'));
    expect(button).toBeTruthy('open sidebar button exists');
    //button.click();
  }));
});
