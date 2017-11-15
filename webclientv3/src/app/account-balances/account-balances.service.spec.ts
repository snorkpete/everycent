import { TestBed, inject } from '@angular/core/testing';

import { AccountBalancesService } from './account-balances.service';

describe('AccountBalancesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountBalancesService]
    });
  });

  it('should ...', inject([AccountBalancesService], (service: AccountBalancesService) => {
    expect(service).toBeTruthy();
  }));
});
