import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { ApiGateway } from "../../api/api-gateway.service";
import { SinkFundData } from "./sink-fund-data.model";
import { SinkFundTransferData } from "./sink-fund-transfer-data.model";

@Injectable()
export class SinkFundService {
  private _currentSinkFund$ = new BehaviorSubject<SinkFundData>({});

  constructor(private apiGateway: ApiGateway) {}

  getSinkFunds(): Observable<SinkFundData[]> {
    return this.apiGateway.get("/sink_funds");
  }

  getCurrent(): Observable<SinkFundData> {
    return this._currentSinkFund$.asObservable();
  }

  refreshSinkFund(currentId: number): void {
    this.apiGateway
      .get(`/sink_funds/${currentId}`)
      .subscribe((sinkFund: SinkFundData) => {
        this._currentSinkFund$.next(sinkFund);
      });
  }

  save(sinkFund: SinkFundData): Observable<SinkFundData> {
    return this.apiGateway.put(`/sink_funds/${sinkFund.id}`, sinkFund);
  }

  transfer(
    sinkFund: SinkFundData,
    transferData: SinkFundTransferData
  ): Observable<SinkFundData> {
    return this.apiGateway.post(
      `/sink_funds/${sinkFund.id}/transfer_allocation`,
      transferData
    );
  }
}
