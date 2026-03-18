import { describe, it, expect } from 'vitest';
import { abnAmroCreditCardImporter } from './abnAmroCreditCardImporter';

describe('abnAmroCreditCardImporter', () => {
  const startDate = '2025-07-01';
  const endDate = '2025-07-31';

  const regularSample = `20 jul. 2025
GOOGLE*GOOGLE PLAY APP G.CO/HELPPAYÄ IRL
K.J. STEPHEN
- € 2,99
16 jul. 2025
CELLULAR PLANET LOT 4 BAGNA T TTO
K.J. STEPHEN
- € 23,47`;

  const idealSample = `20 jul. 2025
IDEAL BETALING, DANK U
+ € 577,84
16 jul. 2025
IDEAL BETALING, DANK U
+ € 1.500,00`;

  const multipleSample = `6 jul. 2025
KLM NETHERLANDS GP AMSTELVEEN NLD
K.J. STEPHEN
- € 1.124,61
KLM NETHERLANDS GP AMSTELVEEN NLD
K.J. STEPHEN
- € 1.387,61
KLM NETHERLANDS GP AMSTELVEEN NLD
K.J. STEPHEN
- € 1.387,61`;

  const mixedSample = `6 jul. 2025
KLM NETHERLANDS GP AMSTELVEEN NLD
K.J. STEPHEN
- € 1.124,61
IDEAL BETALING, DANK U
+ € 577,84
KLM NETHERLANDS GP AMSTELVEEN NLD
K.J. STEPHEN
- € 1.387,61`;

  describe('regular transactions', () => {
    it('extracts 2 transactions from regular sample', () => {
      const result = abnAmroCreditCardImporter(regularSample, startDate, endDate);
      expect(result.length).toBe(2);
    });

    it('parses first transaction correctly', () => {
      const result = abnAmroCreditCardImporter(regularSample, startDate, endDate);
      const first = result[0];
      expect(first.transaction_date).toBe('2025-07-20');
      expect(first.description).toBe('GOOGLE*GOOGLE PLAY APP G.CO/HELPPAYÄ IRL');
      expect(first.withdrawal_amount).toBe(299);
      expect(first.deposit_amount).toBe(0);
      expect(first.status).toBe('unpaid');
      expect(first.deleted).toBeUndefined();
    });

    it('parses second transaction correctly', () => {
      const result = abnAmroCreditCardImporter(regularSample, startDate, endDate);
      const second = result[1];
      expect(second.transaction_date).toBe('2025-07-16');
      expect(second.description).toBe('CELLULAR PLANET LOT 4 BAGNA T TTO');
      expect(second.withdrawal_amount).toBe(2347);
      expect(second.deposit_amount).toBe(0);
      expect(second.status).toBe('unpaid');
      expect(second.deleted).toBeUndefined();
    });
  });

  describe('iDEAL payments (no cardholder line)', () => {
    it('extracts 2 transactions from iDEAL sample', () => {
      const result = abnAmroCreditCardImporter(idealSample, startDate, endDate);
      expect(result.length).toBe(2);
    });

    it('parses first iDEAL transaction (positive amount)', () => {
      const result = abnAmroCreditCardImporter(idealSample, startDate, endDate);
      const first = result[0];
      expect(first.transaction_date).toBe('2025-07-20');
      expect(first.description).toBe('IDEAL BETALING, DANK U');
      expect(first.withdrawal_amount).toBe(0);
      expect(first.deposit_amount).toBe(57784);
      expect(first.status).toBe('unpaid');
      expect(first.deleted).toBeUndefined();
    });

    it('parses second iDEAL transaction with thousands separator', () => {
      const result = abnAmroCreditCardImporter(idealSample, startDate, endDate);
      const second = result[1];
      expect(second.transaction_date).toBe('2025-07-16');
      expect(second.deposit_amount).toBe(150000);
    });
  });

  describe('multiple transactions per date', () => {
    it('extracts 3 transactions', () => {
      const result = abnAmroCreditCardImporter(multipleSample, startDate, endDate);
      expect(result.length).toBe(3);
    });

    it('all transactions share the same date', () => {
      const result = abnAmroCreditCardImporter(multipleSample, startDate, endDate);
      result.forEach((t) => {
        expect(t.transaction_date).toBe('2025-07-06');
      });
    });

    it('parses amounts correctly across transactions', () => {
      const result = abnAmroCreditCardImporter(multipleSample, startDate, endDate);
      expect(result[0].withdrawal_amount).toBe(112461);
      expect(result[1].withdrawal_amount).toBe(138761);
      expect(result[2].withdrawal_amount).toBe(138761);
    });
  });

  describe('mixed transaction types per date', () => {
    it('extracts 3 transactions', () => {
      const result = abnAmroCreditCardImporter(mixedSample, startDate, endDate);
      expect(result.length).toBe(3);
    });

    it('all share the same date', () => {
      const result = abnAmroCreditCardImporter(mixedSample, startDate, endDate);
      result.forEach((t) => {
        expect(t.transaction_date).toBe('2025-07-06');
      });
    });

    it('parses first regular transaction', () => {
      const result = abnAmroCreditCardImporter(mixedSample, startDate, endDate);
      expect(result[0].description).toBe('KLM NETHERLANDS GP AMSTELVEEN NLD');
      expect(result[0].withdrawal_amount).toBe(112461);
      expect(result[0].deposit_amount).toBe(0);
    });

    it('parses iDEAL transaction in the middle', () => {
      const result = abnAmroCreditCardImporter(mixedSample, startDate, endDate);
      expect(result[1].description).toBe('IDEAL BETALING, DANK U');
      expect(result[1].withdrawal_amount).toBe(0);
      expect(result[1].deposit_amount).toBe(57784);
    });

    it('parses third regular transaction', () => {
      const result = abnAmroCreditCardImporter(mixedSample, startDate, endDate);
      expect(result[2].withdrawal_amount).toBe(138761);
    });
  });

  describe('date filtering', () => {
    it('marks transactions outside the date range as deleted', () => {
      const narrowStart = '2025-07-17';
      const narrowEnd = '2025-07-25';
      const result = abnAmroCreditCardImporter(regularSample, narrowStart, narrowEnd);

      expect(result.length).toBe(2);
      // 20 jul is within range
      expect(result[0].deleted).toBeUndefined();
      // 16 jul is outside range
      expect(result[1].deleted).toBe(true);
    });
  });

  describe('date parsing', () => {
    it('parses dates like "20 jul. 2025"', () => {
      const result = abnAmroCreditCardImporter(regularSample, startDate, endDate);
      expect(result[0].transaction_date).toBe('2025-07-20');
    });

    it('parses dates like "1 jan. 2025"', () => {
      const input = `1 jan. 2025
Some purchase
K.J. STEPHEN
- € 5,00`;
      const result = abnAmroCreditCardImporter(input, '2025-01-01', '2025-01-31');
      expect(result[0].transaction_date).toBe('2025-01-01');
    });
  });

  describe('amount parsing', () => {
    it('handles thousands separator in amounts', () => {
      const input = `6 jul. 2025
KLM NETHERLANDS GP AMSTELVEEN NLD
K.J. STEPHEN
- € 1.124,61`;
      const result = abnAmroCreditCardImporter(input, startDate, endDate);
      expect(result[0].withdrawal_amount).toBe(112461);
    });

    it('handles amounts without sign (treated as positive)', () => {
      const input = `20 jul. 2025
Some deposit
€ 10,50`;
      const result = abnAmroCreditCardImporter(input, startDate, endDate);
      expect(result[0].deposit_amount).toBe(1050);
    });
  });

  describe('empty / null input', () => {
    it('returns empty array for empty string', () => {
      expect(abnAmroCreditCardImporter('', startDate, endDate)).toEqual([]);
    });

    it('returns empty array for null input', () => {
      expect(abnAmroCreditCardImporter(null as unknown as string, startDate, endDate)).toEqual([]);
    });
  });
});
