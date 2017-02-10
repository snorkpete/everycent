
import {ApiGateway} from './api-gateway.service';
import {async, inject, TestBed} from '@angular/core/testing';
import {
  BaseRequestOptions, BaseResponseOptions, ConnectionBackend, Http, HttpModule, RequestOptions, Response, ResponseOptions,
  XHRBackend
} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';

describe('ApiGateway', () => {

  let apiGateway: ApiGateway, mockBackend: MockBackend;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
      ],
      providers: [
        ApiGateway,
        {
          provide: Http,
          useFactory: (_mockBackend: MockBackend, options: RequestOptions) => {
            return new Http(_mockBackend, options);
          },
          deps: [MockBackend, BaseRequestOptions]
        },
        MockBackend,
        BaseRequestOptions,
      ]
    });
  });

  beforeEach(inject([ApiGateway, MockBackend], (_apiGateway: ApiGateway, _mockBackend: MockBackend) => {
    apiGateway = _apiGateway;
    mockBackend = _mockBackend;
  }));

  describe('get()', () => {

    it('makes a request to the url', async(() => {

      let mockResponse = [
        {id: 0, name: 'Account 0'},
        {id: 1, name: 'Account 1'},
        {id: 2, name: 'Account 2'},
        {id: 3, name: 'Account 3'},
      ];

      mockBackend.connections.subscribe((connection: MockConnection) => {
        connection.mockRespond(new Response( new ResponseOptions({body: JSON.stringify(mockResponse)})));
      });

      apiGateway.get()
        .subscribe(accounts => {
          expect(accounts.length).toEqual(4, '4 accounts returned');
        });
    }));
  });
});

