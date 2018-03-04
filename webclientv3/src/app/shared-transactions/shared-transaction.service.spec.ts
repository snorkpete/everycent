import { TestBed, inject } from '@angular/core/testing';
import {TestConfigModule} from "../../../test/test-config.module";

import { SharedTransactionService } from './shared-transaction.service';

describe('SharedTransactionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
      ],
      providers: [SharedTransactionService]
    });
  });

  it('should be created', inject([SharedTransactionService], (service: SharedTransactionService) => {
    expect(service).toBeTruthy();
  }));
});
