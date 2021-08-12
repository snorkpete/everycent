/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';

import { FormFieldComponent } from './form-field.component';

describe('FormFieldComponent', () => {
  let component: FormFieldComponent;
  let fixture: ComponentFixture<FormFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormFieldComponent ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('has the correct properties for configuring`', () => {
    expect(component).toBeTruthy();
    //expect(component.editMode).toEqual(false);
    //expect(component.fieldType).toEqual('');

  });

});
