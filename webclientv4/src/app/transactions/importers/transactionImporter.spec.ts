import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transactionImporter } from './transactionImporter';
import * as abnAmroBankImporterModule from './abnAmroBankImporter';
import * as abnAmroCreditCardImporterModule from './abnAmroCreditCardImporter';
import * as scotiaImporterModule from './scotiaImporter';

vi.mock('./abnAmroBankImporter', () => ({
  abnAmroBankImporter: vi.fn().mockReturnValue([]),
}));
vi.mock('./abnAmroCreditCardImporter', () => ({
  abnAmroCreditCardImporter: vi.fn().mockReturnValue([]),
}));
vi.mock('./scotiaImporter', () => ({
  scotiaImporter: vi.fn().mockReturnValue([]),
}));

describe('transactionImporter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const input = 'some raw input';
  const startDate = '2025-04-01';
  const endDate = '2025-04-30';

  describe('dispatching to the right importer', () => {
    it('routes "abn-amro-bank" to abnAmroBankImporter', () => {
      transactionImporter(input, startDate, endDate, 'abn-amro-bank');

      expect(abnAmroBankImporterModule.abnAmroBankImporter).toHaveBeenCalledWith(input, startDate, endDate);
      expect(abnAmroCreditCardImporterModule.abnAmroCreditCardImporter).not.toHaveBeenCalled();
      expect(scotiaImporterModule.scotiaImporter).not.toHaveBeenCalled();
    });

    it('routes "abn-amro-creditcard" to abnAmroCreditCardImporter', () => {
      transactionImporter(input, startDate, endDate, 'abn-amro-creditcard');

      expect(abnAmroCreditCardImporterModule.abnAmroCreditCardImporter).toHaveBeenCalledWith(input, startDate, endDate);
      expect(abnAmroBankImporterModule.abnAmroBankImporter).not.toHaveBeenCalled();
      expect(scotiaImporterModule.scotiaImporter).not.toHaveBeenCalled();
    });

    it('routes "new-bank-account" to scotiaImporter', () => {
      transactionImporter(input, startDate, endDate, 'new-bank-account');

      expect(scotiaImporterModule.scotiaImporter).toHaveBeenCalledWith(input, startDate, endDate);
      expect(abnAmroBankImporterModule.abnAmroBankImporter).not.toHaveBeenCalled();
      expect(abnAmroCreditCardImporterModule.abnAmroCreditCardImporter).not.toHaveBeenCalled();
    });
  });

  describe('return values', () => {
    it('returns transactions from the matched importer', () => {
      const fakeTransactions = [{ id: 1, description: 'Test' }];
      vi.mocked(abnAmroBankImporterModule.abnAmroBankImporter).mockReturnValue(fakeTransactions);

      const result = transactionImporter(input, startDate, endDate, 'abn-amro-bank');

      expect(result).toEqual(fakeTransactions);
    });
  });

  describe('unknown import type', () => {
    it('returns empty array for unknown importType', () => {
      const result = transactionImporter(input, startDate, endDate, 'unknown-format');

      expect(result).toEqual([]);
      expect(abnAmroBankImporterModule.abnAmroBankImporter).not.toHaveBeenCalled();
      expect(abnAmroCreditCardImporterModule.abnAmroCreditCardImporter).not.toHaveBeenCalled();
      expect(scotiaImporterModule.scotiaImporter).not.toHaveBeenCalled();
    });

    it('returns empty array when importType is undefined', () => {
      const result = transactionImporter(input, startDate, endDate, undefined);

      expect(result).toEqual([]);
    });
  });
});
