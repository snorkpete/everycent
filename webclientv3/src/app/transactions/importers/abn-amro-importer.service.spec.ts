import { TestBed, inject } from '@angular/core/testing';

import { AbnAmroImporterService } from './abn-amro-importer.service';

describe('AbnAmroImporterService', () => {
  let importer: AbnAmroImporterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AbnAmroImporterService]
    });
  });

  beforeEach(() => {
    importer = TestBed.get(AbnAmroImporterService);
  })

  describe('#isDate', () => {
    it('returns false for "other text"', () => {
      expect(importer.isDate("other text")).toBeFalsy();
    });
    it('returns true for "23 Dec `17"', () => {
      expect(importer.isDate("23 Dec `17")).toBeTruthy();
    });
    it('returns true for "2017-12-23"', () => {
      expect(importer.isDate("23-12-2017")).toBeTruthy();
    });
  });

  describe('#extractDate', () => {
    it('returns date for "23 Dec `17"', () => {
      expect(importer.extractDate("23 Dec `17")).toEqual(new Date(2017, 11, 23));
    });
    it('returns true for "23 Dec `17"', () => {
      expect(importer.extractDate("random")).toBeUndefined();
    });
    it('returns true for "2017-12-23"', () => {
      expect(importer.extractDate("23-12-2017")).toEqual(new Date("2017-12-23"));
    });
  });
});
