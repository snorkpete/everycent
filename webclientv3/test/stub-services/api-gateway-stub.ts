import {Observable} from "rxjs/Observable";

let ApiGatewayStub = {
  get: (url: string, params: any) => { Observable.of(null); },
  post: (url: string, params: any, data?: any) => {},
  put: (url: string, params: any, data?: any) => {}
}

export {ApiGatewayStub};

