import { TestBed, inject } from "@angular/core/testing";
import { TestConfigModule } from "../../../test/test-config.module";
import { SharedModule } from "../shared/shared.module";

import { SetupService } from "./setup.service";

describe("SetupService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule, SharedModule.forRoot()],
      providers: [SetupService]
    });
  });

  it(
    "should be created",
    inject([SetupService], (service: SetupService) => {
      expect(service).toBeTruthy();
    })
  );
});
