import { TestBed, inject } from '@angular/core/testing';
import {Observable} from "rxjs/Observable";
import {TestConfigModule} from "../../../test/test-config.module";
import {ApiGateway} from "../../api/api-gateway.service";
import {SettingsData} from "./settings-data.model";

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let settingsService: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
      ],
      providers: [SettingsService]
    });
  });

  beforeEach(() => {
    settingsService = TestBed.get(SettingsService);
  });

  describe("#getSettings", () => {
    it("calls the apiGateway properly", () => {
      let apiGateway: ApiGateway = TestBed.get(ApiGateway);
      let sampleSettings: SettingsData = {
        primary_budget_account_id: 5,
        bank_charges_allocation_name: 'Bank Charges',
        husband: 'John',
        wife: 'Sally'
      };
      let spy = spyOn(apiGateway, "get").and.returnValue(Observable.of(sampleSettings));
      settingsService.getSettings().subscribe(settings => {
        expect(settings).toEqual(sampleSettings);
      });
      expect(spy.calls.count()).toEqual(1);
      let args = spy.calls.mostRecent().args;
      expect(args[0]).toEqual('/settings');
    });
  });

  describe("#saveSettings", () => {
    it("calls the apiGateway properly", () => {
      let apiGateway: ApiGateway = TestBed.get(ApiGateway);
      let sampleSettings: SettingsData = {
        primary_budget_account_id: 5,
        bank_charges_allocation_name: 'Bank Charges',
        husband: 'John',
        wife: 'Sally'
      };
      let spy = spyOn(apiGateway, "post").and.returnValue(Observable.of(sampleSettings));
      settingsService.saveSettings(sampleSettings).subscribe(settings => {
        expect(settings).toEqual(sampleSettings);
      });
      expect(spy.calls.count()).toEqual(1);
      let args = spy.calls.mostRecent().args;
      expect(args[0]).toEqual('/settings');
      expect(args[1]).toEqual(sampleSettings);
    });
  });
});
