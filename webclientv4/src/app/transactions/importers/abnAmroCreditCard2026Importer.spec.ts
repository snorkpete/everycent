import { describe, it, expect } from 'vitest';
import { abnAmroCreditCard2026Importer } from './abnAmroCreditCard2026Importer';

describe('abnAmroCreditCard2026Importer', () => {
  const startDate = '2026-02-28';
  const endDate = '2026-03-27';

  // Synthetic sample modeled on the ABN AMRO credit-card statement format
  const fullSample = `2026

Current Period
28 februari to 27 maart 2026
24 mrt 2026
Transaction description:ACMEAUDIO NEWARK USA
Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
€ 0,00
Transaction description:SHOPCO.COM DUBLIN IRL
Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 61,02
RESERVED

22 mrt 2026
Transaction description:CLOUDCO*Z4PRP1WGRY1L D02FD79 IRL
RECURRING

Cardholder:K.J. STEPHEN
Transaction amount:
- € 106,22
Transaction description:PAYPAL *MEMBERSVCIREL M 35314369001 IRL
RECURRING

Cardholder:K.J. STEPHEN
Transaction amount:
- € 5,45
20 mrt 2026
Transaction description:APPCO*APPCO PLAY APP DUBLIN IRL
RECURRING

Cardholder:K.J. STEPHEN
Transaction amount:
- € 2,99
18 mrt 2026
Transaction description:AICO.AI SUBSCRIPTION SAN FRANCISCO USA
Cardholder:K.J. STEPHEN
Transaction amount:
- € 95,02
Transaction description:FERRYCO LINE B.V. HOEK VAN HOLL NLD
Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 646,50
17 mrt 2026
Transaction description:VOICECO.IO NEW YORK USA
Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 5,40
15 mrt 2026
Transaction description:WWW.SPORTCO.COM LONDON GBR
RECURRING

Cardholder:K.J. STEPHEN
Transaction amount:
- € 11,90
Transaction description:SHOPRIMENL*BO6OK1L75 LUXEMBOURG LUX
RECURRING

Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 49,90
Transaction description:APPCO*APPCO PLAY APP DUBLIN IRL
Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 9,99
14 mrt 2026
Transaction description:IDEAL BETALING, DANK U
Transaction amount:
+ € 887,33
12 mrt 2026
Transaction description:PRINTCO INK NL AMSTELVEEN NLD
RECURRING

Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 5,49
Transaction description:MEMBER ASSOCIATION GLASGOW GBR
Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 385,52
11 mrt 2026
Transaction description:TOPUP 220172540 DUBLIN IRL
Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 5,46
Transaction description:TOPUP 220172501 DUBLIN IRL
Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 5,46
7 mrt 2026
Transaction description:AICO.AI SUBSCRIPTION SAN FRANCISCO USA
RECURRING

Cardholder:K.J. STEPHEN
Transaction amount:
- € 21,78
5 mrt 2026
Transaction description:GRAND HOTEL ALMERE ALMERE NLD
Cardholder:K.J. STEPHEN
Transaction amount:
- € 30,00
Transaction description:GRAND HOTEL ALMERE ALMERE NLD
Cardholder:K.J. STEPHEN
Transaction amount:
- € 99,10
4 mrt 2026
Transaction description:HOSTCO* FEB-110431881 SAN FRANCISCO USA
RECURRING

Cardholder:K.J. STEPHEN
Transaction amount:
- € 12,38
Transaction description:APPCO*APPCO ONE DUBLIN IRL
RECURRING

Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 29,99
3 mrt 2026
Transaction description:SOFTCO*SOFTCO 36 BILLCO.INFO IRL
RECURRING

Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 129,00
2 mrt 2026
Transaction description:INSURECO WESTMOORINGS TTO
Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 51,70
Transaction description:INSURECO WESTMOORINGS TTO
Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 35,83
28 feb 2026
Transaction description:VRCO *U6JFBED572 DUBLIN IRL
RECURRING

Cardholder:K.J. STEPHEN
Transaction amount:
- € 8,99
Transaction description:STREAMCO.COM LOS GATOS USA
RECURRING

Cardholder:K.J. STEPHEN
Transaction amount:
- € 17,31
Transaction description:APPCO*VIDEOPREMIUM LONDON GBR
RECURRING

Cardholder:K.J. STEPHEN
Transaction amount:
- € 25,99`;

  describe('full sample parsing', () => {
    it('extracts all complete transactions', () => {
      const result = abnAmroCreditCard2026Importer(fullSample, startDate, endDate);
      // 27 transactions with amounts in the sample (last entry MEDIUM MONTHLY is truncated/missing)
      expect(result.length).toBe(27);
    });

    it('parses the first transaction correctly', () => {
      const result = abnAmroCreditCard2026Importer(fullSample, startDate, endDate);
      const first = result[0];
      expect(first.transaction_date).toBe('2026-03-24');
      expect(first.description).toBe('ACMEAUDIO NEWARK USA');
      expect(first.withdrawal_amount).toBe(0);
      expect(first.deposit_amount).toBe(0);
      expect(first.status).toBe('unpaid');
    });

    it('parses a negative amount correctly', () => {
      const result = abnAmroCreditCard2026Importer(fullSample, startDate, endDate);
      // SHOPCO.COM is the second transaction
      const shopco = result[1];
      expect(shopco.transaction_date).toBe('2026-03-24');
      expect(shopco.description).toBe('SHOPCO.COM DUBLIN IRL');
      expect(shopco.withdrawal_amount).toBe(6102);
      expect(shopco.deposit_amount).toBe(0);
    });

    it('parses iDEAL positive amount correctly', () => {
      const result = abnAmroCreditCard2026Importer(fullSample, startDate, endDate);
      // IDEAL BETALING on 14 mrt
      const ideal = result.find((t) => t.description === 'IDEAL BETALING, DANK U');
      expect(ideal).toBeDefined();
      expect(ideal!.transaction_date).toBe('2026-03-14');
      expect(ideal!.withdrawal_amount).toBe(0);
      expect(ideal!.deposit_amount).toBe(88733);
    });

    it('ignores RECURRING and RESERVED tags', () => {
      const result = abnAmroCreditCard2026Importer(fullSample, startDate, endDate);
      // CLOUDCO has RECURRING tag — should still parse correctly
      const cloudco = result.find((t) => t.description!.includes('CLOUDCO'));
      expect(cloudco).toBeDefined();
      expect(cloudco!.withdrawal_amount).toBe(10622);
    });

    it('ignores header junk (year, Current Period, date range)', () => {
      const result = abnAmroCreditCard2026Importer(fullSample, startDate, endDate);
      // No transaction should have "2026" or "Current Period" as description
      result.forEach((t) => {
        expect(t.description).not.toBe('2026');
        expect(t.description).not.toBe('Current Period');
        expect(t.description).not.toContain('februari');
      });
    });

    it('handles transactions with RECURRING between description and cardholder', () => {
      const result = abnAmroCreditCard2026Importer(fullSample, startDate, endDate);
      const sportco = result.find((t) => t.description!.includes('WWW.SPORTCO.COM'));
      expect(sportco).toBeDefined();
      expect(sportco!.transaction_date).toBe('2026-03-15');
      expect(sportco!.withdrawal_amount).toBe(1190);
    });

    it('parses last complete transaction (APPCO*VIDEOPREMIUM)', () => {
      const result = abnAmroCreditCard2026Importer(fullSample, startDate, endDate);
      const last = result[result.length - 1];
      expect(last.description).toBe('APPCO*VIDEOPREMIUM LONDON GBR');
      expect(last.transaction_date).toBe('2026-02-28');
      expect(last.withdrawal_amount).toBe(2599);
    });
  });

  describe('date parsing', () => {
    it('parses "24 mrt 2026" (no dot after month)', () => {
      const input = `24 mrt 2026
Transaction description:TEST PURCHASE
Transaction amount:
- € 10,00`;
      const result = abnAmroCreditCard2026Importer(input, startDate, endDate);
      expect(result[0].transaction_date).toBe('2026-03-24');
    });

    it('parses "28 feb 2026"', () => {
      const input = `28 feb 2026
Transaction description:TEST PURCHASE
Transaction amount:
- € 10,00`;
      const result = abnAmroCreditCard2026Importer(input, startDate, endDate);
      expect(result[0].transaction_date).toBe('2026-02-28');
    });

    it('parses English month names (mar, may, oct)', () => {
      const input = `24 mar 2026
Transaction description:TEST PURCHASE
Transaction amount:
- € 10,00`;
      const result = abnAmroCreditCard2026Importer(input, startDate, endDate);
      expect(result[0].transaction_date).toBe('2026-03-24');
    });

    it('parses Dutch month names (mrt, mei, okt)', () => {
      const input = `15 mei 2026
Transaction description:TEST PURCHASE
Transaction amount:
- € 10,00`;
      const result = abnAmroCreditCard2026Importer(input, '2026-05-01', '2026-05-31');
      expect(result[0].transaction_date).toBe('2026-05-15');
    });

    it('still parses old format "20 jul. 2025" with dot', () => {
      const input = `20 jul. 2025
Transaction description:TEST PURCHASE
Transaction amount:
- € 10,00`;
      const result = abnAmroCreditCard2026Importer(input, '2025-07-01', '2025-07-31');
      expect(result[0].transaction_date).toBe('2025-07-20');
    });
  });

  describe('labeled fields', () => {
    it('extracts description from "Transaction description:" label', () => {
      const input = `10 mrt 2026
Transaction description:SOME MERCHANT NAME
Cardholder:K.J. STEPHEN
Transaction amount:
- € 25,00`;
      const result = abnAmroCreditCard2026Importer(input, startDate, endDate);
      expect(result[0].description).toBe('SOME MERCHANT NAME');
    });

    it('handles iDEAL without cardholder line', () => {
      const input = `14 mrt 2026
Transaction description:IDEAL BETALING, DANK U
Transaction amount:
+ € 500,00`;
      const result = abnAmroCreditCard2026Importer(input, startDate, endDate);
      expect(result[0].deposit_amount).toBe(50000);
      expect(result[0].withdrawal_amount).toBe(0);
    });
  });

  describe('noise handling', () => {
    it('skips RECURRING tags between fields', () => {
      const input = `10 mrt 2026
Transaction description:STREAMCO.COM LOS GATOS USA
RECURRING

Cardholder:K.J. STEPHEN
Transaction amount:
- € 17,31`;
      const result = abnAmroCreditCard2026Importer(input, startDate, endDate);
      expect(result.length).toBe(1);
      expect(result[0].description).toBe('STREAMCO.COM LOS GATOS USA');
      expect(result[0].withdrawal_amount).toBe(1731);
    });

    it('skips RESERVED tag after amount', () => {
      const input = `24 mrt 2026
Transaction description:SHOPCO.COM DUBLIN IRL
Cardholder:P.A. STEPHEN | Extra Card
Transaction amount:
- € 61,02
RESERVED`;
      const result = abnAmroCreditCard2026Importer(input, startDate, endDate);
      expect(result.length).toBe(1);
      expect(result[0].withdrawal_amount).toBe(6102);
    });
  });

  describe('date filtering', () => {
    it('marks transactions outside date range as deleted', () => {
      const input = `24 mrt 2026
Transaction description:INSIDE RANGE
Transaction amount:
- € 10,00
28 feb 2026
Transaction description:OUTSIDE RANGE
Transaction amount:
- € 20,00`;
      const result = abnAmroCreditCard2026Importer(input, '2026-03-01', '2026-03-27');
      expect(result[0].deleted).toBeUndefined();
      expect(result[1].deleted).toBe(true);
    });
  });

  describe('incomplete transactions', () => {
    it('skips transactions with no amount', () => {
      const input = `27 feb 2026
Transaction description:MEDIUM MONTHLY SAN FRANCISCO USA
RECURRING

Cardholder:K.J. STEPHEN`;
      const result = abnAmroCreditCard2026Importer(input, startDate, endDate);
      expect(result.length).toBe(0);
    });
  });

  describe('amount parsing', () => {
    it('handles zero amounts', () => {
      const input = `24 mrt 2026
Transaction description:ACMEAUDIO NEWARK USA
Transaction amount:
€ 0,00`;
      const result = abnAmroCreditCard2026Importer(input, startDate, endDate);
      expect(result[0].withdrawal_amount).toBe(0);
      expect(result[0].deposit_amount).toBe(0);
    });

    it('handles thousands separator', () => {
      const input = `14 mrt 2026
Transaction description:BIG PURCHASE
Transaction amount:
- € 1.250,00`;
      const result = abnAmroCreditCard2026Importer(input, startDate, endDate);
      expect(result[0].withdrawal_amount).toBe(125000);
    });
  });

  describe('empty input', () => {
    it('returns empty array for empty string', () => {
      expect(abnAmroCreditCard2026Importer('', startDate, endDate)).toEqual([]);
    });

    it('returns empty array for null input', () => {
      expect(abnAmroCreditCard2026Importer(null as unknown as string, startDate, endDate)).toEqual(
        [],
      );
    });

    it('returns empty array for header-only input', () => {
      const input = `2026

Current Period
28 februari to 27 maart 2026`;
      expect(abnAmroCreditCard2026Importer(input, startDate, endDate)).toEqual([]);
    });
  });
});
