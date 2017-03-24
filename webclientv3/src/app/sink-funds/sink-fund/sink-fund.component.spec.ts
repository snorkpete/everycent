/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';

import { SinkFundComponent } from './sink-fund.component';
import {FlexLayoutModule} from '@angular/flex-layout';

describe('SinkFundComponent', () => {
  let component: SinkFundComponent;
  let fixture: ComponentFixture<SinkFundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FlexLayoutModule],
      declarations: [ SinkFundComponent ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SinkFundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to "non-edit-mode"', () => {
    expect(component.isEditMode).toBeFalsy('non-edit-mode by default');
  });

});
