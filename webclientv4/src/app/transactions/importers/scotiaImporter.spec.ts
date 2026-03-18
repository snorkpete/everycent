import { describe, it, expect } from 'vitest';
import { scotiaImporter } from './scotiaImporter';

describe('scotiaImporter', () => {
  const startDate = '2016-08-01';
  const endDate = '2016-08-31';

  describe('empty / null input', () => {
    it('returns empty array for empty string', () => {
      expect(scotiaImporter('', startDate, endDate)).toEqual([]);
    });

    it('returns empty array for null input', () => {
      expect(scotiaImporter(null as unknown as string, startDate, endDate)).toEqual([]);
    });
  });

  describe('bank account transactions', () => {
    const input = `Aug 17
2016\tPOS PURCHASE
Other
-$52.00 TTD\t$947.00 TTD
Aug 12
2016\tCUSTOMER TRANSFER (B/DT)
Transfer
$75.00 TTD`;

    it('returns 2 transactions', () => {
      const result = scotiaImporter(input, startDate, endDate);
      expect(result.length).toBe(2);
    });

    it('parses first transaction as withdrawal', () => {
      const result = scotiaImporter(input, startDate, endDate);
      const first = result[0];
      expect(first.withdrawal_amount).toBe(5200);
      expect(first.deposit_amount).toBe(0);
      expect(first.transaction_date).toBeDefined();
    });

    it('parses second transaction as deposit', () => {
      const result = scotiaImporter(input, startDate, endDate);
      const second = result[1];
      expect(second.deposit_amount).toBe(7500);
      expect(second.withdrawal_amount).toBe(0);
    });

    it('includes description from second line', () => {
      const result = scotiaImporter(input, startDate, endDate);
      expect(result[0].description).toContain('POS PURCHASE');
    });
  });

  describe('date filtering', () => {
    const input = `Aug 17
2016\tPOS PURCHASE
Other
-$52.00 TTD`;

    it('marks transactions inside range as not deleted', () => {
      const result = scotiaImporter(input, startDate, endDate);
      expect(result[0].deleted).toBeUndefined();
    });

    it('marks transactions outside range as deleted', () => {
      const result = scotiaImporter(input, '2016-09-01', '2016-09-30');
      expect(result[0].deleted).toBe(true);
    });
  });

  describe('zero amount transactions', () => {
    const input = `Aug 17
2016\tSOME ZERO TRANSACTION
Other
$0.00 TTD`;

    it('marks zero-amount transactions as deleted', () => {
      const result = scotiaImporter(input, startDate, endDate);
      expect(result[0].deleted).toBe(true);
    });
  });

  describe('amounts with comma separators', () => {
    const input = `Aug 17
2016\tLARGE DEPOSIT
Transfer
$1,500.00 TTD`;

    it('parses amount with commas correctly', () => {
      const result = scotiaImporter(input, startDate, endDate);
      expect(result[0].deposit_amount).toBe(150000);
    });
  });

  describe('incomplete data', () => {
    it('returns empty object for groups with fewer than 4 lines', () => {
      const input = `Aug 17
2016\tPOS PURCHASE
Other`;
      const result = scotiaImporter(input, startDate, endDate);
      // 3 lines forms one incomplete group — returns [{}]
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({});
    });
  });
});
