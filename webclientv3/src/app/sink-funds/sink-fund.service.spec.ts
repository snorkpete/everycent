/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SinkFundService } from './sink-fund.service';
import {ApiGateway} from '../../api/api-gateway.service';
import {ApiGatewayStub} from '../../../test/api-gateway-stub';
import {SampleSinkFundData} from '../../../test/sample-sink-fund-data';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

describe('SinkFundService', () => {

  let sinkFundService: SinkFundService;
  let apiGateway: ApiGateway;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SinkFundService,
        { provide: ApiGateway, useValue: ApiGatewayStub },
      ]
    });
  });

  beforeEach(inject([SinkFundService, ApiGateway], (service: SinkFundService, gateway) => {
    sinkFundService = service;
    apiGateway = gateway;
  }));

  it('exists', () => {
    expect(sinkFundService).toBeTruthy();
  });

  describe('#getCurrent()', () => {

    it('exists', async(() => {
      expect(sinkFundService.getCurrent).toBeDefined();
    }));

    it('calls apiGateway correctly', async(() => {
      let response = SampleSinkFundData;
      let spy = spyOn(apiGateway, 'get').and.returnValue(Observable.of(response));

      sinkFundService.getCurrent().subscribe(sinkFund => {

          expect(spy.calls.any()).toBeTruthy('calls the apiGateway');
          expect(spy.calls.mostRecent().args[0]).toEqual('/sink_funds/current');
          expect(sinkFund).toEqual(SampleSinkFundData);
        });
    }));
  });

  describe('#save()', () => {

    it('calls the apiGateway correctly', async(() => {
      let sample = SampleSinkFundData;
      let spy = spyOn(apiGateway, 'post').and.returnValue(Observable.of(sample));

      sinkFundService.save(sample).subscribe(response => {
        expect(spy.calls.any()).toBeTruthy('calls the apiGateway');
        expect(spy.calls.mostRecent().args[0]).toEqual(`/sink_funds/${sample.id}`);
        expect(spy.calls.mostRecent().args[1]).toEqual(sample);
        expect(response).toEqual(sample);
      });

    }));
  })
});
