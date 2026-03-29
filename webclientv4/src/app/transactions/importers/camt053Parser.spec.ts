// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import type { CamtParserInput } from './camt053Parser';
import { parseCamt053Xml } from './camt053Parser';

// -- Helpers ------------------------------------------------------------------

function makeXml(opts: { iban?: string; entries?: string }): string {
  const iban = opts.iban ?? 'NL62ABNA0123456789';
  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Acct><Id><IBAN>${iban}</IBAN></Id></Acct>
      ${opts.entries ?? ''}
    </Stmt>
  </BkToCstmrStmt>
</Document>`;
}

function beaEntry(opts: {
  ref?: string;
  amount?: string;
  cdtDbt?: string;
  bookingDate?: string;
  valueDate?: string;
  addtlNtryInf?: string;
}): string {
  const date = opts.bookingDate ?? '2026-02-23';
  return `
<Ntry>
  <Amt Ccy="EUR">${opts.amount ?? '000000000000004.87'}</Amt>
  <CdtDbtInd>${opts.cdtDbt ?? 'DBIT'}</CdtDbtInd>
  <BookgDt><Dt>${date}</Dt></BookgDt>
  <ValDt><Dt>${opts.valueDate ?? date}</Dt></ValDt>
  <AcctSvcrRef>${opts.ref ?? 'REF001'}</AcctSvcrRef>
  <BkTxCd><Prtry><Cd>N426</Cd></Prtry></BkTxCd>
  <AddtlNtryInf>${opts.addtlNtryInf ?? 'BEA, Betaalpas                  Albert Heijn 2242,PAS363        NR:BS159644, 23.02.26/12:56     ALMERE'}</AddtlNtryInf>
</Ntry>`;
}

function sepaEntry(opts: {
  ref?: string;
  amount?: string;
  cdtDbt?: string;
  bookingDate?: string;
  valueDate?: string;
  addtlNtryInf?: string;
  creditorName?: string;
  debtorName?: string;
}): string {
  const partyEl = opts.debtorName
    ? `<Dbtr><Nm>${opts.debtorName}</Nm></Dbtr>`
    : `<Cdtr><Nm>${opts.creditorName ?? 'Simpel'}</Nm></Cdtr>`;

  const date = opts.bookingDate ?? '2026-02-20';
  return `
<Ntry>
  <Amt Ccy="EUR">${opts.amount ?? '000000000000012.50'}</Amt>
  <CdtDbtInd>${opts.cdtDbt ?? 'DBIT'}</CdtDbtInd>
  <BookgDt><Dt>${date}</Dt></BookgDt>
  <ValDt><Dt>${opts.valueDate ?? date}</Dt></ValDt>
  <AcctSvcrRef>${opts.ref ?? 'REF002'}</AcctSvcrRef>
  <BkTxCd><Prtry><Cd>N654</Cd></Prtry></BkTxCd>
  <AddtlNtryInf>${opts.addtlNtryInf ?? '/TRTP/SEPA Incasso /NAME/Simpel'}</AddtlNtryInf>
  <NtryDtls>
    <TxDtls>
      <RltdPties>${partyEl}</RltdPties>
    </TxDtls>
  </NtryDtls>
</Ntry>`;
}

function internationalEntry(opts: {
  ref?: string;
  amount?: string;
  cdtDbt?: string;
  bookingDate?: string;
  valueDate?: string;
  addtlNtryInf?: string;
}): string {
  const date = opts.bookingDate ?? '2026-02-18';
  return `
<Ntry>
  <Amt Ccy="EUR">${opts.amount ?? '000000000000050.00'}</Amt>
  <CdtDbtInd>${opts.cdtDbt ?? 'DBIT'}</CdtDbtInd>
  <BookgDt><Dt>${date}</Dt></BookgDt>
  <ValDt><Dt>${opts.valueDate ?? date}</Dt></ValDt>
  <AcctSvcrRef>${opts.ref ?? 'REF003'}</AcctSvcrRef>
  <BkTxCd><Prtry><Cd>N785</Cd></Prtry></BkTxCd>
  <AddtlNtryInf>${opts.addtlNtryInf ?? '  International Wire Transfer to XYZ Corp  '}</AddtlNtryInf>
</Ntry>`;
}

const defaultBankAccounts = [
  { id: 1, accountNo: 'NL62ABNA0123456789', accountType: 'checking' },
  { id: 2, accountNo: 'NL91ABNA9876543210', accountType: 'credit_card' },
];

const defaultStartDate = '2026-02-01';
const defaultEndDate = '2026-02-28';

// -- Tests --------------------------------------------------------------------

describe('camt053Parser', () => {
  describe('parseCamt053Xml', () => {
    describe('basic entry extraction', () => {
      it('extracts entries from Stmt/Ntry elements', () => {
        const xml = makeXml({ entries: beaEntry({}) });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts).toHaveLength(1);
        expect(result.accounts[0].transactions).toHaveLength(1);
      });

      it('extracts multiple entries from a single statement', () => {
        const xml = makeXml({
          entries: beaEntry({ ref: 'REF001' }) + sepaEntry({ ref: 'REF002' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions).toHaveLength(2);
      });

      it('handles multiple XML files', () => {
        const xml1 = makeXml({
          iban: 'NL62ABNA0123456789',
          entries: beaEntry({ ref: 'REF001' }),
        });
        const xml2 = makeXml({
          iban: 'NL91ABNA9876543210',
          entries: sepaEntry({ ref: 'REF002' }),
        });
        const result = parseCamt053Xml(
          [xml1, xml2],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts).toHaveLength(2);
      });
    });

    describe('IBAN grouping', () => {
      it('groups transactions by owner IBAN from Stmt/Acct/Id/IBAN', () => {
        const xml1 = makeXml({
          iban: 'NL62ABNA0123456789',
          entries: beaEntry({ ref: 'REF001' }),
        });
        const xml2 = makeXml({
          iban: 'NL62ABNA0123456789',
          entries: beaEntry({ ref: 'REF002' }),
        });
        const result = parseCamt053Xml(
          [xml1, xml2],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts).toHaveLength(1);
        expect(result.accounts[0].iban).toBe('NL62ABNA0123456789');
        expect(result.accounts[0].transactions).toHaveLength(2);
      });
    });

    describe('bank account matching', () => {
      it('sets bankAccountId by matching IBAN to provided bank accounts via accountNo', () => {
        const xml = makeXml({
          iban: 'NL62ABNA0123456789',
          entries: beaEntry({}),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].bankAccountId).toBe(1);
        expect(result.accounts[0].transactions[0].bank_account_id).toBe(1);
      });

      it('sets bankAccountId to undefined for unmatched IBANs', () => {
        const xml = makeXml({
          iban: 'NL99UNKN0000000000',
          entries: beaEntry({}),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].bankAccountId).toBeUndefined();
        expect(result.accounts[0].transactions[0].bank_account_id).toBeUndefined();
      });

      it('does not drop transactions with unmatched IBANs', () => {
        const xml = makeXml({
          iban: 'NL99UNKN0000000000',
          entries: beaEntry({}),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts).toHaveLength(1);
        expect(result.accounts[0].transactions).toHaveLength(1);
      });

      it('matches when accountNo has spaces but IBAN in XML does not', () => {
        const xml = makeXml({
          iban: 'NL62ABNA0123456789',
          entries: beaEntry({}),
        });
        const spacedAccounts = [
          { id: 1, accountNo: 'NL62 ABNA 0123 4567 89', accountType: 'checking' },
        ];
        const result = parseCamt053Xml([xml], spacedAccounts, defaultStartDate, defaultEndDate);
        expect(result.accounts[0].bankAccountId).toBe(1);
      });

      it('matches when IBAN in XML has spaces but accountNo does not', () => {
        const xml = makeXml({
          iban: 'NL62 ABNA 0123 4567 89',
          entries: beaEntry({}),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].bankAccountId).toBe(1);
      });

      it('matches when both accountNo and IBAN have spaces', () => {
        const xml = makeXml({
          iban: 'NL62 ABNA 0123 4567 89',
          entries: beaEntry({}),
        });
        const spacedAccounts = [
          { id: 1, accountNo: 'NL62 ABNA 0123 4567 89', accountType: 'checking' },
        ];
        const result = parseCamt053Xml([xml], spacedAccounts, defaultStartDate, defaultEndDate);
        expect(result.accounts[0].bankAccountId).toBe(1);
      });
    });

    describe('bank_ref extraction', () => {
      it('extracts bank_ref from AcctSvcrRef', () => {
        const xml = makeXml({
          entries: beaEntry({ ref: 'ABC123XYZ' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].bank_ref).toBe('ABC123XYZ');
      });
    });

    describe('deduplication', () => {
      it('deduplicates entries across XML files by AcctSvcrRef', () => {
        const xml1 = makeXml({
          entries: beaEntry({ ref: 'DUPREF' }),
        });
        const xml2 = makeXml({
          entries: beaEntry({ ref: 'DUPREF' }),
        });
        const result = parseCamt053Xml(
          [xml1, xml2],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions).toHaveLength(1);
        expect(result.accounts[0].transactions[0].bank_ref).toBe('DUPREF');
      });

      it('keeps entries with different AcctSvcrRef values', () => {
        const xml = makeXml({
          entries: beaEntry({ ref: 'REF_A' }) + beaEntry({ ref: 'REF_B' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions).toHaveLength(2);
      });
    });

    describe('amount conversion', () => {
      it('converts zero-padded EUR format to cents (e.g. 000000000000004.87 -> 487)', () => {
        const xml = makeXml({
          entries: beaEntry({ amount: '000000000000004.87', cdtDbt: 'DBIT' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        const t = result.accounts[0].transactions[0];
        expect(t.withdrawal_amount).toBe(487);
        expect(t.deposit_amount).toBe(0);
      });

      it('handles larger amounts correctly', () => {
        const xml = makeXml({
          entries: beaEntry({ amount: '000000000001523.99', cdtDbt: 'DBIT' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].withdrawal_amount).toBe(152399);
      });

      it('handles whole number amounts without fractional part', () => {
        const xml = makeXml({
          entries: beaEntry({ amount: '000000000000100.00', cdtDbt: 'CRDT' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].deposit_amount).toBe(10000);
      });

      it('handles normal decimal format amounts', () => {
        const xml = makeXml({
          entries: beaEntry({ amount: '15.50', cdtDbt: 'DBIT' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].withdrawal_amount).toBe(1550);
      });
    });

    describe('debit/credit indicator', () => {
      it('sets withdrawal_amount for DBIT entries', () => {
        const xml = makeXml({
          entries: beaEntry({ amount: '000000000000010.00', cdtDbt: 'DBIT' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        const t = result.accounts[0].transactions[0];
        expect(t.withdrawal_amount).toBe(1000);
        expect(t.deposit_amount).toBe(0);
      });

      it('sets deposit_amount for CRDT entries', () => {
        const xml = makeXml({
          entries: beaEntry({ amount: '000000000000025.00', cdtDbt: 'CRDT' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        const t = result.accounts[0].transactions[0];
        expect(t.withdrawal_amount).toBe(0);
        expect(t.deposit_amount).toBe(2500);
      });
    });

    describe('transaction_date', () => {
      it('sets transaction_date from ValDt/Dt', () => {
        const xml = makeXml({
          entries: beaEntry({ valueDate: '2026-02-15' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].transaction_date).toBe('2026-02-15');
      });

      it('uses value date for weekend transactions booked on Monday', () => {
        // 2026-02-14 = Saturday, 2026-02-16 = Monday (bank booking day)
        const xml = makeXml({
          entries: beaEntry({
            valueDate: '2026-02-14',
            ref: 'WEEKEND_SAT',
          }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].transaction_date).toBe('2026-02-14');
      });
    });

    describe('period filtering', () => {
      it('marks transactions outside budget period as deleted: true', () => {
        const xml = makeXml({
          entries: beaEntry({ valueDate: '2026-01-15', ref: 'OUTSIDE' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].deleted).toBe(true);
      });

      it('does not mark transactions within budget period as deleted', () => {
        const xml = makeXml({
          entries: beaEntry({ valueDate: '2026-02-15', ref: 'INSIDE' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].deleted).toBeUndefined();
      });

      it('includes transactions on start date boundary', () => {
        const xml = makeXml({
          entries: beaEntry({ valueDate: '2026-02-01', ref: 'START' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].deleted).toBeUndefined();
      });

      it('includes transactions on end date boundary', () => {
        const xml = makeXml({
          entries: beaEntry({ valueDate: '2026-02-28', ref: 'END' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].deleted).toBeUndefined();
      });

      it('marks transactions after end date as deleted', () => {
        const xml = makeXml({
          entries: beaEntry({ valueDate: '2026-03-01', ref: 'AFTER' }),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].deleted).toBe(true);
      });
    });

    describe('status assignment', () => {
      it('sets status to "paid" for checking accounts', () => {
        const xml = makeXml({
          iban: 'NL62ABNA0123456789',
          entries: beaEntry({}),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].status).toBe('paid');
      });

      it('sets status to "unpaid" for credit card accounts', () => {
        const xml = makeXml({
          iban: 'NL91ABNA9876543210',
          entries: sepaEntry({}),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].status).toBe('unpaid');
      });

      it('sets status to "paid" for unmatched IBANs (default)', () => {
        const xml = makeXml({
          iban: 'NL99UNKN0000000000',
          entries: beaEntry({}),
        });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts[0].transactions[0].status).toBe('paid');
      });
    });

    describe('description extraction', () => {
      describe('BEA/GEA card payments', () => {
        it('extracts merchant name from BEA AddtlNtryInf', () => {
          const xml = makeXml({
            entries: beaEntry({
              addtlNtryInf:
                'BEA, Betaalpas                  Albert Heijn 2242,PAS363        NR:BS159644, 23.02.26/12:56     ALMERE',
            }),
          });
          const result = parseCamt053Xml(
            [xml],
            defaultBankAccounts,
            defaultStartDate,
            defaultEndDate,
          );
          expect(result.accounts[0].transactions[0].description).toBe('Albert Heijn 2242,PAS363');
        });

        it('extracts merchant name from GEA AddtlNtryInf', () => {
          const xml = makeXml({
            entries: beaEntry({
              addtlNtryInf:
                'GEA, Geldautomaat              ING Bank Almere,PAS363          NR:GS123456, 20.02.26/10:30     ALMERE',
            }),
          });
          const result = parseCamt053Xml(
            [xml],
            defaultBankAccounts,
            defaultStartDate,
            defaultEndDate,
          );
          expect(result.accounts[0].transactions[0].description).toBe('ING Bank Almere,PAS363');
        });

        it('trims trailing spaces from merchant name', () => {
          const xml = makeXml({
            entries: beaEntry({
              addtlNtryInf:
                'BEA, Betaalpas                  JUMBO 1234,PAS363              NR:BS111111, 23.02.26/12:56     ALMERE',
            }),
          });
          const result = parseCamt053Xml(
            [xml],
            defaultBankAccounts,
            defaultStartDate,
            defaultEndDate,
          );
          expect(result.accounts[0].transactions[0].description).toBe('JUMBO 1234,PAS363');
        });
      });

      describe('SEPA types', () => {
        it('uses creditor name from TxDtls/RltdPties/Cdtr/Nm', () => {
          const xml = makeXml({
            entries: sepaEntry({
              creditorName: 'Simpel',
              addtlNtryInf: '/TRTP/SEPA Incasso /NAME/Simpel Telecommunicatie BV /MARF/12345',
            }),
          });
          const result = parseCamt053Xml(
            [xml],
            defaultBankAccounts,
            defaultStartDate,
            defaultEndDate,
          );
          expect(result.accounts[0].transactions[0].description).toBe('Simpel');
        });

        it('uses debtor name from TxDtls/RltdPties/Dbtr/Nm for credits', () => {
          const xml = makeXml({
            entries: sepaEntry({
              debtorName: 'John Doe',
              cdtDbt: 'CRDT',
              addtlNtryInf: '/TRTP/SEPA Overboeking /NAME/John Doe',
            }),
          });
          const result = parseCamt053Xml(
            [xml],
            defaultBankAccounts,
            defaultStartDate,
            defaultEndDate,
          );
          expect(result.accounts[0].transactions[0].description).toBe('John Doe');
        });

        it('falls back to /NAME/ from AddtlNtryInf when TxDtls is absent', () => {
          // Entry with /NAME/ in AddtlNtryInf but no TxDtls
          const entryXml = `
<Ntry>
  <Amt Ccy="EUR">000000000000015.00</Amt>
  <CdtDbtInd>DBIT</CdtDbtInd>
  <BookgDt><Dt>2026-02-20</Dt></BookgDt>
  <ValDt><Dt>2026-02-20</Dt></ValDt>
  <AcctSvcrRef>REF_FALLBACK</AcctSvcrRef>
  <BkTxCd><Prtry><Cd>N658</Cd></Prtry></BkTxCd>
  <AddtlNtryInf>/TRTP/SEPA Incasso /NAME/Energiedirect BV /MARF/EDB-000123 /REMI/Maandtermijn</AddtlNtryInf>
</Ntry>`;
          const xml = makeXml({ entries: entryXml });
          const result = parseCamt053Xml(
            [xml],
            defaultBankAccounts,
            defaultStartDate,
            defaultEndDate,
          );
          expect(result.accounts[0].transactions[0].description).toBe('Energiedirect BV');
        });
      });

      describe('international transactions', () => {
        it('uses full AddtlNtryInf trimmed for international entries', () => {
          const xml = makeXml({
            entries: internationalEntry({
              addtlNtryInf: '  International Wire Transfer to XYZ Corp  ',
            }),
          });
          const result = parseCamt053Xml(
            [xml],
            defaultBankAccounts,
            defaultStartDate,
            defaultEndDate,
          );
          expect(result.accounts[0].transactions[0].description).toBe(
            'International Wire Transfer to XYZ Corp',
          );
        });
      });

      describe('edge cases', () => {
        it('uses trimmed AddtlNtryInf when no pattern matches and no TxDtls', () => {
          const entryXml = `
<Ntry>
  <Amt Ccy="EUR">000000000000005.00</Amt>
  <CdtDbtInd>DBIT</CdtDbtInd>
  <BookgDt><Dt>2026-02-20</Dt></BookgDt>
  <ValDt><Dt>2026-02-20</Dt></ValDt>
  <AcctSvcrRef>REF_EDGE</AcctSvcrRef>
  <BkTxCd><Prtry><Cd>N999</Cd></Prtry></BkTxCd>
  <AddtlNtryInf>  Some unknown format  </AddtlNtryInf>
</Ntry>`;
          const xml = makeXml({ entries: entryXml });
          const result = parseCamt053Xml(
            [xml],
            defaultBankAccounts,
            defaultStartDate,
            defaultEndDate,
          );
          expect(result.accounts[0].transactions[0].description).toBe('Some unknown format');
        });
      });
    });

    describe('output shape', () => {
      it('returns CamtParseResult with accounts array', () => {
        const xml = makeXml({ entries: beaEntry({}) });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result).toHaveProperty('accounts');
        expect(Array.isArray(result.accounts)).toBe(true);
      });

      it('each account has iban, bankAccountId, and transactions', () => {
        const xml = makeXml({ entries: beaEntry({}) });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        const account = result.accounts[0];
        expect(account).toHaveProperty('iban');
        expect(account).toHaveProperty('bankAccountId');
        expect(account).toHaveProperty('transactions');
      });

      it('transactions do not have allocation_id or sink_fund_allocation_id set', () => {
        const xml = makeXml({ entries: beaEntry({}) });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        const t = result.accounts[0].transactions[0];
        expect(t.allocation_id).toBeUndefined();
        expect(t.sink_fund_allocation_id).toBeUndefined();
      });
    });

    describe('empty input', () => {
      it('returns empty accounts for empty XML array', () => {
        const result = parseCamt053Xml([], defaultBankAccounts, defaultStartDate, defaultEndDate);
        expect(result.accounts).toHaveLength(0);
      });

      it('returns empty transactions for XML with no entries', () => {
        const xml = makeXml({ entries: '' });
        const result = parseCamt053Xml(
          [xml],
          defaultBankAccounts,
          defaultStartDate,
          defaultEndDate,
        );
        expect(result.accounts).toHaveLength(1);
        expect(result.accounts[0].transactions).toHaveLength(0);
      });
    });
  });

  describe('parseCamt053Zip', () => {
    it('extracts XML files from zip and parses them', async () => {
      const xmlContent = makeXml({
        entries: beaEntry({ ref: 'ZIP_REF' }),
      });

      // Mock JSZip
      const mockJSZip = {
        loadAsync: vi.fn().mockResolvedValue({
          files: {
            'statement1.xml': {
              dir: false,
              async: vi.fn().mockResolvedValue(xmlContent),
            },
            'subfolder/': {
              dir: true,
              async: vi.fn(),
            },
          },
        }),
      };

      vi.doMock('jszip', () => ({
        default: { loadAsync: mockJSZip.loadAsync },
      }));

      // Re-import after mocking
      const { parseCamt053Zip: parseFn } = await import('./camt053Parser');

      const mockFile = new File(['fake-zip-content'], 'statements.zip', {
        type: 'application/zip',
      });

      const input: CamtParserInput = {
        file: mockFile,
        bankAccounts: defaultBankAccounts,
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      };

      const result = await parseFn(input);
      expect(result.accounts).toHaveLength(1);
      expect(result.accounts[0].transactions[0].bank_ref).toBe('ZIP_REF');

      vi.doUnmock('jszip');
    });

    it('only processes .xml files from the zip', async () => {
      const xmlContent = makeXml({
        entries: beaEntry({ ref: 'XML_ONLY' }),
      });

      const mockJSZip = {
        loadAsync: vi.fn().mockResolvedValue({
          files: {
            'statement.xml': {
              dir: false,
              async: vi.fn().mockResolvedValue(xmlContent),
            },
            'readme.txt': {
              dir: false,
              async: vi.fn().mockResolvedValue('not xml'),
            },
            'data.csv': {
              dir: false,
              async: vi.fn().mockResolvedValue('a,b,c'),
            },
          },
        }),
      };

      vi.doMock('jszip', () => ({
        default: { loadAsync: mockJSZip.loadAsync },
      }));

      const { parseCamt053Zip: parseFn } = await import('./camt053Parser');

      const mockFile = new File(['fake'], 'test.zip', { type: 'application/zip' });
      const input: CamtParserInput = {
        file: mockFile,
        bankAccounts: defaultBankAccounts,
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      };

      const result = await parseFn(input);
      expect(result.accounts).toHaveLength(1);
      expect(result.accounts[0].transactions).toHaveLength(1);

      vi.doUnmock('jszip');
    });

    it('handles multiple XML files in the zip', async () => {
      const xml1 = makeXml({
        iban: 'NL62ABNA0123456789',
        entries: beaEntry({ ref: 'REF_ZIP1' }),
      });
      const xml2 = makeXml({
        iban: 'NL91ABNA9876543210',
        entries: sepaEntry({ ref: 'REF_ZIP2' }),
      });

      const mockJSZip = {
        loadAsync: vi.fn().mockResolvedValue({
          files: {
            'stmt1.xml': {
              dir: false,
              async: vi.fn().mockResolvedValue(xml1),
            },
            'stmt2.xml': {
              dir: false,
              async: vi.fn().mockResolvedValue(xml2),
            },
          },
        }),
      };

      vi.doMock('jszip', () => ({
        default: { loadAsync: mockJSZip.loadAsync },
      }));

      const { parseCamt053Zip: parseFn } = await import('./camt053Parser');

      const mockFile = new File(['fake'], 'test.zip', { type: 'application/zip' });
      const input: CamtParserInput = {
        file: mockFile,
        bankAccounts: defaultBankAccounts,
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      };

      const result = await parseFn(input);
      expect(result.accounts).toHaveLength(2);

      vi.doUnmock('jszip');
    });
  });
});
