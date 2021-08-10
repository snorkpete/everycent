import { TestBed, inject } from "@angular/core/testing";
import { of } from "rxjs";
import { TestConfigModule } from "../../../test/test-config.module";
import { ApiGateway } from "../../api/api-gateway.service";
import { SettingsData } from "./settings-data.model";

import { SettingsService } from "./settings.service";

describe("SettingsService", () => {
  let settingsService: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule],
      providers: [SettingsService]
    });
  });

  beforeEach(() => {
    settingsService = TestBed.inject(SettingsService);
  });

  describe("#getSettings", () => {
    it("calls the apiGateway properly", () => {
      let apiGateway: ApiGateway = TestBed.inject(ApiGateway);
      let sampleSettings: SettingsData = {
        primary_budget_account_id: 5,
        bank_charges_allocation_name: "Bank Charges",
        husband: "John",
        wife: "Sally",
        family_type: "couple"
      };
      let spy = spyOn(apiGateway, "get").and.returnValue(of(sampleSettings));
      settingsService.getSettings().subscribe(settings => {
        expect(settings).toEqual(sampleSettings);
      });
      expect(spy.calls.count()).toEqual(1);
      let args = spy.calls.mostRecent().args;
      expect(args[0]).toEqual("/settings");
    });
  });

  describe("#saveSettings", () => {
    it("calls the apiGateway properly", () => {
      let apiGateway: ApiGateway = TestBed.inject(ApiGateway);
      let sampleSettings: SettingsData = {
        primary_budget_account_id: 5,
        bank_charges_allocation_name: "Bank Charges",
        husband: "John",
        wife: "Sally",
        family_type: "couple"
      };
      let spy = spyOn(apiGateway, "post").and.returnValue(of(sampleSettings));
      settingsService.saveSettings(sampleSettings).subscribe(settings => {
        expect(settings).toEqual(sampleSettings);
      });
      expect(spy.calls.count()).toEqual(1);
      let args = spy.calls.mostRecent().args;
      expect(args[0]).toEqual("/settings");
      expect(args[1]).toEqual(sampleSettings);
    });
  });
});
