import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ApiGateway} from '../../api/api-gateway.service';
import {SinkFundData} from './sink-fund-data.model';

@Injectable()
export class SinkFundService {

  constructor(
    private apiGateway: ApiGateway
  ) { }

  getCurrent(): Observable<SinkFundData> {
    return this.apiGateway.get('/sink_funds/current');
  }

}
