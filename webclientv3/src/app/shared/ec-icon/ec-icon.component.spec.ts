/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';

import { EcIconComponent } from './ec-icon.component';

describe('EcIconComponent', () => {
  let component: EcIconComponent;
  let fixture: ComponentFixture<EcIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcIconComponent ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
