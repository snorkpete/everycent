import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { ApiGateway } from "../../api/api-gateway.service";

@Injectable({
  providedIn: "root"
})
export class ReportingService {
  constructor(private apiGateway: ApiGateway) {}

  getNetWorth(): Observable<any[]> {
    return this.apiGateway.get("/reports/net_worth");
  }
}
