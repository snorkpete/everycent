import { Observable, of } from "rxjs";
import { SettingsData } from "../../src/app/shared/settings-data.model";

const sample: SettingsData = {
  husband: "Hubby",
  wife: "Wifey",
  primary_budget_account_id: 0,
  family_type: "couple"
};

const singleSample: SettingsData = {
  single_person: "Single Joe",
  primary_budget_account_id: 0,
  family_type: "single"
};

const SettingsServiceStub = {
  getSettings(): Observable<SettingsData> {
    return of(this.sample);
  },
  saveSettings(newSettings: SettingsData): Observable<SettingsData> {
    return of(this.sample);
  }
};

export { SettingsServiceStub };
