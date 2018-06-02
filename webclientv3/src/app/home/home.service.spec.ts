import { TestBed, inject } from "@angular/core/testing";
import { TestConfigModule } from "../../../test/test-config.module";

import { HomeService } from "./home.service";

describe("HomeService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule],
      providers: [HomeService]
    });
  });

  it(
    "should be created",
    inject([HomeService], (service: HomeService) => {
      expect(service).toBeTruthy();
    })
  );
});
