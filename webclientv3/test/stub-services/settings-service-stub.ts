import { Observable } from "rxjs/Observable";
import { SettingsData } from "../../src/app/shared/settings-data.model";

const sample: SettingsData = {
  husband: "Hubby",
  wife: "Wifey",
  primary_budget_account_id: 0,
  bank_charges_allocation_name: "none"
};

const SettingsServiceStub = {
  getSettings(): Observable<SettingsData> {
    return Observable.of(this.sample);
  },
  saveSettings(newSettings: SettingsData): Observable<SettingsData> {
    return Observable.of(this.sample);
  }
};

export { SettingsServiceStub };
