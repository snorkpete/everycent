import { TestBed, inject } from '@angular/core/testing';

import { TransactionService } from './transaction.service';
import {TestConfigModule} from "../../../test/test-config.module";

describe('TransactionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
      ],
      providers: [TransactionService]
    });
  });

  it('should ...', inject([TransactionService], (service: TransactionService) => {
    expect(service).toBeTruthy();
  }));
});
