import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {ApiGateway} from "../../api/api-gateway.service";
import {SettingsData} from "./settings-data.model";

@Injectable()
export class SettingsService {

  constructor(
    private apiGateway: ApiGateway
  ) { }

  getSettings(): Observable<SettingsData> {
    return this.apiGateway.get('/settings');
  }

  saveSettings(newSettings: SettingsData): Observable<SettingsData> {
    return this.apiGateway.post('/settings', newSettings);
  }
}
