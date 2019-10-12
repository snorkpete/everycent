import { TestBed, inject } from "@angular/core/testing";
import { TestConfigModule } from "../../../test/test-config.module";
import { SharedModule } from "../shared/shared.module";

import { ReportingService } from "./reporting.service";

describe("ReportingService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule, SharedModule.forRoot()],
      providers: [ReportingService]
    });
  });

  it("should be created", inject(
    [ReportingService],
    (service: ReportingService) => {
      expect(service).toBeTruthy();
    }
  ));
});
