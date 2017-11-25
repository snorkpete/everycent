/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';

import { MainToolbarComponent } from './main-toolbar.component';
import {SharedModule} from '../shared.module';
import {MainToolbarService} from './main-toolbar.service';
import {EcMaterialModule} from "../ec-material/ec-material.module";

describe('MainToolbarComponent', () => {
  let component: MainToolbarComponent;
  let fixture: ComponentFixture<MainToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [EcMaterialModule],
      declarations: [ MainToolbarComponent ],
      providers: [
        MainToolbarService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
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
