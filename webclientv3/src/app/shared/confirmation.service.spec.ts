import { TestBed, inject } from '@angular/core/testing';
import {TestConfigModule} from "../../../test/test-config.module";

import { ConfirmationService } from './confirmation.service';
import {SharedModule} from "./shared.module";

describe('ConfirmationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule, SharedModule.forRoot(),
      ],
      providers: [ConfirmationService]
    });
  });

  it('should be created', inject([ConfirmationService], (service: ConfirmationService) => {
    expect(service).toBeTruthy();
  }));
});
