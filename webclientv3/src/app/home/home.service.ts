import { Injectable } from "@angular/core";
import { ApiGateway } from "../../api/api-gateway.service";

@Injectable({
  providedIn: "root"
})
export class HomeService {
  constructor(private apiGateway: ApiGateway) {}

  getLastUpdate() {
    return this.apiGateway.get("/transactions/last_update");
  }
}
