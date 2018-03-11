import {Observable} from "rxjs/Observable";

let ApiGatewayStub = {
  get: (url: string, params: any) => Observable.of([]),
  post: (url: string, params: any, data?: any) => Observable.of([]),
  put: (url: string, params: any, data?: any) => Observable.of([])
};

export {ApiGatewayStub};

