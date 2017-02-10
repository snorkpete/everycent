import {ApiGateway} from './api-gateway.service';
import {async, inject, TestBed} from '@angular/core/testing';
import {BaseRequestOptions, Http, HttpModule, Request, RequestMethod, RequestOptions, Response, ResponseOptions} from '@angular/http';
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

    let request: Request;
    let connection: MockConnection;

    beforeEach(async(() => {
      // grab the mock connection and request to inspect them later
      mockBackend.connections.subscribe((_connection: MockConnection) => {
        connection = _connection;
        request = _connection.request;
      });
    }));

    it("requests the correct url", async(() => {
      let url = "accounts";
      apiGateway.get(url).subscribe();
      expect(request.url).toContain(url, 'requests the correct url');
    }));

    it("makes a 'GET' request", async(() => {
      apiGateway.get('hello').subscribe();
      expect(request.method).toEqual(RequestMethod.Get);
    }));

    it('makes a request to the url', async(() => {
      let mockResponse = [
        {id: 0, name: 'Account 0'},
        {id: 1, name: 'Account 1'},
        {id: 2, name: 'Account 2'},
        {id: 2, name: 'Account 2'},
      ];

      apiGateway.get('random')
        .subscribe(accounts => {
          expect(accounts.length).toEqual(4, '4 accounts returned');
        });
      let response = new Response( new ResponseOptions({body: JSON.stringify(mockResponse)}));
      connection.mockRespond(response);
    }));

  });
});

