import { TestBed, inject } from '@angular/core/testing';

import { AbnAmroOldFormatImporterService } from './abn-amro-old-format-importer.service';

describe('AbnAmroOldFormatImporterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AbnAmroOldFormatImporterService]
    });
  });

  it('should be created', inject([AbnAmroOldFormatImporterService], (service: AbnAmroOldFormatImporterService) => {
    expect(service).toBeTruthy();
  }));
});
