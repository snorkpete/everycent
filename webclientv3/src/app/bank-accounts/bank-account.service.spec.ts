import { TestBed, inject } from '@angular/core/testing';

import { BankAccountService } from './bank-account.service';

describe('BankAccountService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BankAccountService]
    });
  });

  it('should be created', inject([BankAccountService], (service: BankAccountService) => {
    expect(service).toBeTruthy();
  }));
});
