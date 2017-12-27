import { TestBed, inject } from '@angular/core/testing';

import { FcbImporterService } from './fcb-importer.service';

describe('FcbImporterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FcbImporterService]
    });
  });

  it('should be created', inject([FcbImporterService], (service: FcbImporterService) => {
    expect(service).toBeTruthy();
  }));
});
