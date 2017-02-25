/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SinkFundsComponent } from './sink-funds.component';

describe('SinkFundsComponent', () => {
  let component: SinkFundsComponent;
  let fixture: ComponentFixture<SinkFundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SinkFundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SinkFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
