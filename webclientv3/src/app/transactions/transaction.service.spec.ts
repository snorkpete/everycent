import { TestBed, inject } from '@angular/core/testing';

import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransactionService]
    });
  });

  xit('should ...', inject([TransactionService], (service: TransactionService) => {
    expect(service).toBeTruthy();
  }));
});
