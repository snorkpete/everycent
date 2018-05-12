import { of } from "rxjs";

let ApiGatewayStub = {
  get: (url: string, params: any) => of([]),
  post: (url: string, params: any, data?: any) => of([]),
  put: (url: string, params: any, data?: any) => of([])
};

export { ApiGatewayStub };
