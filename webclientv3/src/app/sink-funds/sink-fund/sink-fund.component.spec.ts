/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SinkFundComponent } from './sink-fund.component';

describe('SinkFundComponent', () => {
  let component: SinkFundComponent;
  let fixture: ComponentFixture<SinkFundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SinkFundComponent ]
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
});
