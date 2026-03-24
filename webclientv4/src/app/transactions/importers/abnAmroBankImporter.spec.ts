import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { abnAmroBankImporter, dateProvider } from './abnAmroBankImporter';

describe('abnAmroBankImporter', () => {
  const startDate = '2025-04-01';
  const endDate = '2025-04-30';

  const originalToday = dateProvider.today;
  beforeEach(() => {
    dateProvider.today = () => new Date(2025, 3, 25);
  });
  afterEach(() => {
    dateProvider.today = originalToday;
  });

  const sampleInput = `
April 2025
IS
INT CARD SERVICES
Fr 25 Apr • iDEAL
Amount:- 351.58
Account: Sink Fund Account, Description: Overboeking ,
SA
Sink Fund Account
Fr 25 Apr • Overboeking
Amount:+ 200.00
Account: Zalando Payments GmbH, Description: iDEAL ,
OC
OLYMPIC CATERING,PAS352
Th 24 Apr • Betaalpas
Amount:- 12.50
Account: PICNIC BY BUCKAROO, Description: Incasso algemeen doorlopend,
PB
PICNIC BY BUCKAROO
Th 24 Apr • Incasso algemeen doorlopend
Amount:- 65.74
Account: Simpel, Description: Incasso algemeen doorlopend,
LM
LYTTOS B MINI MARKET,PAS363
We 23 Apr • Betaalpas
Amount:- 24.09
Account: Sink Fund Account, Description: Overboeking ,
`;

  describe('with full sample', () => {
    it('returns 5 transactions', () => {
      const result = abnAmroBankImporter(sampleInput, startDate, endDate);
      expect(result.length).toBe(5);
    });

    it('parses first transaction correctly', () => {
      const result = abnAmroBankImporter(sampleInput, startDate, endDate);
      const first = result[0];
      expect(first.transaction_date).toBe('2025-04-25');
      expect(first.withdrawal_amount).toBe(35158);
      expect(first.deposit_amount).toBe(0);
      expect(first.description).toBe('INT CARD SERVICES');
      expect(first.status).toBe('paid');
    });

    it('parses deposit transaction (second)', () => {
      const result = abnAmroBankImporter(sampleInput, startDate, endDate);
      const second = result[1];
      expect(second.transaction_date).toBe('2025-04-25');
      expect(second.withdrawal_amount).toBe(0);
      expect(second.deposit_amount).toBe(20000);
      expect(second.description).toBe('Sink Fund Account');
    });

    it('parses third transaction correctly', () => {
      const result = abnAmroBankImporter(sampleInput, startDate, endDate);
      const third = result[2];
      expect(third.transaction_date).toBe('2025-04-24');
      expect(third.withdrawal_amount).toBe(1250);
      expect(third.deposit_amount).toBe(0);
      expect(third.description).toBe('OLYMPIC CATERING,PAS352');
    });

    it('parses fifth transaction correctly', () => {
      const result = abnAmroBankImporter(sampleInput, startDate, endDate);
      const fifth = result[4];
      expect(fifth.transaction_date).toBe('2025-04-23');
      expect(fifth.withdrawal_amount).toBe(2409);
      expect(fifth.deposit_amount).toBe(0);
      expect(fifth.description).toBe('LYTTOS B MINI MARKET,PAS363');
    });

    it('does not mark in-range transactions as deleted', () => {
      const result = abnAmroBankImporter(sampleInput, startDate, endDate);
      result.forEach((t) => {
        expect(t.deleted).toBeUndefined();
      });
    });
  });

  describe('date filtering', () => {
    it('marks transactions outside the date range as deleted', () => {
      const narrowStart = '2025-04-24';
      const narrowEnd = '2025-04-25';
      const result = abnAmroBankImporter(sampleInput, narrowStart, narrowEnd);

      // 23 Apr is outside range
      const aprilTwentyThird = result.find((t) => t.transaction_date === '2025-04-23');
      expect(aprilTwentyThird).toBeDefined();
      expect(aprilTwentyThird!.deleted).toBe(true);

      // 24 and 25 Apr are within range
      const inRange = result.filter((t) => !t.deleted);
      inRange.forEach((t) => {
        expect(['2025-04-24', '2025-04-25']).toContain(t.transaction_date);
      });
    });
  });

  describe('empty / null input', () => {
    it('returns empty array for empty string', () => {
      expect(abnAmroBankImporter('', startDate, endDate)).toEqual([]);
    });

    it('returns empty array for null input', () => {
      expect(abnAmroBankImporter(null as unknown as string, startDate, endDate)).toEqual([]);
    });
  });

  describe('date formats', () => {
    it('parses long-form day abbreviation (Mon|Tue|…)', () => {
      const input = `
Fri, 25 Apr • Some payment
Amount:- 10.00
`;
      const result = abnAmroBankImporter(input, startDate, endDate);
      expect(result.length).toBe(1);
      expect(result[0].transaction_date).toBe('2025-04-25');
    });

    it('parses short-form day abbreviation (Mo|Tu|…)', () => {
      const input = `
Fr 25 Apr • Some payment
Amount:- 10.00
`;
      const result = abnAmroBankImporter(input, startDate, endDate);
      expect(result.length).toBe(1);
      expect(result[0].transaction_date).toBe('2025-04-25');
    });
  });

  describe('amount parsing', () => {
    it('parses Amount:+ prefix correctly', () => {
      const input = `
Fr 25 Apr • Some deposit
Amount:+ 15,295.01
`;
      const result = abnAmroBankImporter(input, startDate, endDate);
      expect(result[0].deposit_amount).toBe(1529501);
      expect(result[0].withdrawal_amount).toBe(0);
    });

    it('marks zero-amount transactions as deleted', () => {
      const input = `
Fr 25 Apr • Zero transaction
Amount:+ 0.00
`;
      const result = abnAmroBankImporter(input, startDate, endDate);
      expect(result[0].deleted).toBe(true);
    });
  });

  describe('skippable lines', () => {
    it('skips two-letter initials lines', () => {
      const input = `
IS
INT CARD SERVICES
Fr 25 Apr • iDEAL
Amount:- 10.00
`;
      const result = abnAmroBankImporter(input, startDate, endDate);
      expect(result.length).toBe(1);
      expect(result[0].description).toBe('INT CARD SERVICES');
    });

    it('skips month/year headings', () => {
      const input = `
April 2025
INT CARD SERVICES
Fr 25 Apr • iDEAL
Amount:- 10.00
`;
      const result = abnAmroBankImporter(input, startDate, endDate);
      expect(result.length).toBe(1);
    });

    it('skips Account: ... lines', () => {
      const input = `
INT CARD SERVICES
Fr 25 Apr • iDEAL
Amount:- 10.00
Account: Some Bank, Description: something,
`;
      const result = abnAmroBankImporter(input, startDate, endDate);
      expect(result.length).toBe(1);
    });
  });
});
