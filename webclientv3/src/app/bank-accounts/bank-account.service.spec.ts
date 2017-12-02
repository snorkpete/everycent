import { TestBed, inject } from '@angular/core/testing';

import { BankAccountService } from './bank-account.service';
import {TestConfigModule} from "../../../test/test-config.module";

describe('BankAccountService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
      ],
      providers: [BankAccountService]
    });
  });

  it('should be created', inject([BankAccountService], (service: BankAccountService) => {
    expect(service).toBeTruthy();
  }));
});
