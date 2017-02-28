/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';

import { SinkFundsComponent } from './sink-funds.component';
import {SinkFundService} from './sink-fund.service';
import {ApiGateway} from '../../api/api-gateway.service';
import {ApiGatewayStub} from '../../../test/api-gateway-stub';
import {SampleSinkFundData} from '../../../test/sample-sink-fund-data';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

describe('SinkFundsComponent', () => {
  let component: SinkFundsComponent;
  let fixture: ComponentFixture<SinkFundsComponent>;

  let sinkFundService: SinkFundService;
  let apiGateway: ApiGateway;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SinkFundsComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        SinkFundService,
        { provide: ApiGateway, useValue: ApiGatewayStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(inject([SinkFundService], (service, gateway) => {
    fixture = TestBed.createComponent(SinkFundsComponent);
    component = fixture.componentInstance;

    sinkFundService = service;
    apiGateway = gateway;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('gets the current sink fund', async(() => {
    let response = SampleSinkFundData;
    let spy = spyOn(sinkFundService, 'getCurrent').and.returnValue(Observable.of(response));

    fixture.detectChanges();
    expect(component.sinkFund).toEqual(response);

  }));
});
