import {ApiGateway} from './api-gateway.service';
import {inject, TestBed} from '@angular/core/testing';
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

    beforeEach(() => {
      // grab the mock connection and request to inspect them later
      mockBackend.connections.subscribe((_connection: MockConnection) => {
        connection = _connection;
        request = _connection.request;
      });
    });

    it("requests the correct url", () => {
      let url = "accounts";
      apiGateway.get(url).subscribe();
      expect(request.url).toContain(url, 'requests the correct url');
    });

    it("makes a 'GET' request", () => {
      apiGateway.get('hello').subscribe();
      expect(request.method).toEqual(RequestMethod.Get);
    });

    it('converts the result to JSON', () => {
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
    });

    it("encodes its params as part of the URL", () => {
      apiGateway.get('hello', { name: 'joe', last: 'smith'}).subscribe();
      expect(request.url).toContain('hello?name=joe&last=smith');
    });

    it("adds the correct authentication headers", () => {

      // setup the local storage
      // Authentication header values should pull from here
      localStorage.setItem('access-token', 'access');
      localStorage.setItem('client', 'client');
      localStorage.setItem('expiry', 'expiry');
      localStorage.setItem('token-type', 'token');
      localStorage.setItem('uid', 'uid');

      apiGateway.get('hello', { name: 'joe', last: 'smith'}).subscribe();

      expect(request.headers.get('Content-Type')).toEqual('application/json', 'content type matches');
      expect(request.headers.get('access-token')).toEqual('access', 'access token matches');
      expect(request.headers.get('client')).toEqual('client', 'client matches');
      expect(request.headers.get('expiry')).toEqual('expiry', 'expiry matches');
      expect(request.headers.get('token-type')).toEqual('token', 'token type matches');
      expect(request.headers.get('uid')).toEqual('uid', 'uid matches');
    });

  });

  describe('postWithoutAuthentication()', () => {

    let request: Request;
    let connection: MockConnection;

    beforeEach(() => {
      // grab the mock connection and request to inspect them later
      mockBackend.connections.subscribe((_connection: MockConnection) => {
        connection = _connection;
        request = _connection.request;
      });
    });

    it("POSTs to the correct url", () => {
      let url = '/login';
      apiGateway.postWithoutAuthentication(url, {}).subscribe();
      expect(request.url).toContain(url, 'uses correct url');
      expect(request.method).toEqual(RequestMethod.Post, 'uses correct method');
    });

    it("adds additional data to the request body", () => {
      apiGateway.postWithoutAuthentication('test', {mydata: 'yes', name: 'Jess'});

      let requestBodyAsJSON = JSON.parse(request.getBody());
      expect(requestBodyAsJSON).toEqual({mydata: 'yes', name: 'Jess'});

    });

    it("does NOT add any authentication headers", () => {
      apiGateway.postWithoutAuthentication('test', {});
      expect(request.headers.get('Content-Type')).toEqual('application/json', 'has correct content type');
      expect(request.headers.get('access-token')).toEqual(null, 'no access token');
    });

  });
});

