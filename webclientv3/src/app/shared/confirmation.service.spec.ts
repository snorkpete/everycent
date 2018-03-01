import { TestBed, inject } from '@angular/core/testing';

import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfirmationService]
    });
  });

  it('should be created', inject([ConfirmationService], (service: ConfirmationService) => {
    expect(service).toBeTruthy();
  }));
});
