import { TestBed, inject } from '@angular/core/testing';

import { SharedTransactionService } from './shared-transaction.service';

describe('SharedTransactionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharedTransactionService]
    });
  });

  it('should be created', inject([SharedTransactionService], (service: SharedTransactionService) => {
    expect(service).toBeTruthy();
  }));
});
