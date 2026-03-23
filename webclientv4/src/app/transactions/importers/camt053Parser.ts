import type { TransactionData } from '../transaction.types';

// -- Public interfaces --------------------------------------------------------

export interface CamtAccountResult {
  iban: string;
  bankAccountId: number | undefined;
  transactions: TransactionData[];
}

export interface CamtParseResult {
  accounts: CamtAccountResult[];
}

export interface CamtParserInput {
  file: File;
  bankAccounts: { id: number; accountNo: string; accountType: string }[];
  startDate: string;
  endDate: string;
}

// -- Internal types -----------------------------------------------------------

interface RawEntry {
  iban: string;
  bankRef: string;
  amount: number;
  cdtDbtInd: string;
  bookingDate: string;
  description: string;
}

// -- Zip extraction -----------------------------------------------------------

export async function parseCamt053Zip(input: CamtParserInput): Promise<CamtParseResult> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(input.file);

  const xmlStrings: string[] = [];
  for (const [filename, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    if (!filename.toLowerCase().endsWith('.xml')) continue;
    const content = await file.async('string');
    xmlStrings.push(content);
  }

  return parseCamt053Xml(xmlStrings, input.bankAccounts, input.startDate, input.endDate);
}

// -- XML parsing --------------------------------------------------------------

export function parseCamt053Xml(
  xmlStrings: string[],
  bankAccounts: { id: number; accountNo: string; accountType: string }[],
  startDate: string,
  endDate: string,
): CamtParseResult {
  const accountMap = new Map<
    string,
    { bankAccountId: number | undefined; accountType: string | undefined }
  >();
  const entriesByIban = new Map<string, Map<string, RawEntry>>();

  for (const xml of xmlStrings) {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const statements = doc.getElementsByTagName('Stmt');

    for (let s = 0; s < statements.length; s++) {
      const stmt = statements[s];
      const iban = getTextContent(stmt, 'Acct>Id>IBAN') ?? '';

      if (!accountMap.has(iban)) {
        const normalizedIban = iban.replace(/\s/g, '');
        const matched = bankAccounts.find(
          (ba) => ba.accountNo.replace(/\s/g, '') === normalizedIban,
        );
        accountMap.set(iban, {
          bankAccountId: matched?.id,
          accountType: matched?.accountType,
        });
      }

      if (!entriesByIban.has(iban)) {
        entriesByIban.set(iban, new Map());
      }
      const ibanEntries = entriesByIban.get(iban)!;

      const entries = stmt.getElementsByTagName('Ntry');
      for (let e = 0; e < entries.length; e++) {
        const ntry = entries[e];
        const bankRef = getTextContent(ntry, 'AcctSvcrRef') ?? '';

        // Deduplicate by AcctSvcrRef
        if (ibanEntries.has(bankRef)) continue;

        const amountStr = getTextContent(ntry, 'Amt') ?? '0';
        const cdtDbtInd = getTextContent(ntry, 'CdtDbtInd') ?? '';
        const bookingDate = getDirectChildTextContent(ntry, 'BookgDt', 'Dt') ?? '';
        const description = extractDescription(ntry);

        ibanEntries.set(bankRef, {
          iban,
          bankRef,
          amount: amountToCents(amountStr),
          cdtDbtInd,
          bookingDate,
          description,
        });
      }
    }
  }

  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T23:59:59');

  const accounts: CamtAccountResult[] = [];
  for (const [iban, entryMap] of entriesByIban) {
    const meta = accountMap.get(iban)!;
    const status = meta.accountType === 'credit_card' ? 'unpaid' : 'paid';

    const transactions: TransactionData[] = [];
    for (const entry of entryMap.values()) {
      const isDebit = entry.cdtDbtInd === 'DBIT';
      const txDate = new Date(entry.bookingDate + 'T12:00:00');
      const outsidePeriod = txDate < start || txDate > end;

      const transaction: TransactionData = {
        bank_ref: entry.bankRef,
        bank_account_id: meta.bankAccountId,
        transaction_date: entry.bookingDate,
        withdrawal_amount: isDebit ? entry.amount : 0,
        deposit_amount: isDebit ? 0 : entry.amount,
        description: entry.description,
        status,
      };

      if (outsidePeriod) {
        transaction.deleted = true;
      }

      transactions.push(transaction);
    }

    accounts.push({
      iban,
      bankAccountId: meta.bankAccountId,
      transactions,
    });
  }

  return { accounts };
}

// -- Amount conversion --------------------------------------------------------

function amountToCents(amountStr: string): number {
  const num = parseFloat(amountStr);
  return Math.round(num * 100);
}

// -- Description extraction ---------------------------------------------------

function extractDescription(ntry: Element): string {
  const addtlNtryInf = getTextContent(ntry, 'AddtlNtryInf') ?? '';

  // BEA/GEA card payment pattern
  if (addtlNtryInf.startsWith('BEA') || addtlNtryInf.startsWith('GEA')) {
    return extractBeaGeaDescription(addtlNtryInf);
  }

  // SEPA pattern: check for TxDtls with structured party names
  const txDtls = ntry.getElementsByTagName('TxDtls');
  if (txDtls.length > 0) {
    const creditorName = getTextContent(txDtls[0], 'Cdtr>Nm');
    if (creditorName) return creditorName;

    const debtorName = getTextContent(txDtls[0], 'Dbtr>Nm');
    if (debtorName) return debtorName;
  }

  // Fallback: extract /NAME/ from AddtlNtryInf
  if (addtlNtryInf.includes('/NAME/')) {
    return extractNameFromAddtlNtryInf(addtlNtryInf);
  }

  // Best effort: full AddtlNtryInf trimmed
  return addtlNtryInf.trim();
}

function extractBeaGeaDescription(info: string): string {
  // Split on 2+ consecutive spaces, take second segment
  const segments = info.split(/\s{2,}/);
  if (segments.length >= 2) {
    return segments[1].trim();
  }
  return info.trim();
}

function extractNameFromAddtlNtryInf(info: string): string {
  const nameMatch = info.match(/\/NAME\/([^/]*)/);
  if (nameMatch) {
    return nameMatch[1].trim();
  }
  return info.trim();
}

// -- XML helpers --------------------------------------------------------------

/**
 * Walks a `>` separated path (e.g. `Acct>Id>IBAN`) starting from the given element
 * and returns the text content of the final node.
 */
function getTextContent(parent: Element, path: string): string | undefined {
  const parts = path.split('>');
  let current: Element | null = parent;

  for (const tag of parts) {
    if (!current) return undefined;
    const children = current.getElementsByTagName(tag);
    if (children.length === 0) return undefined;
    current = children[0];
  }

  return current?.textContent?.trim() ?? undefined;
}

/**
 * Gets the text content of a nested child, but only looking at direct children
 * of the parent for the first tag, then walking down.
 * Used for BookgDt>Dt to avoid grabbing ValDt>Dt instead.
 */
function getDirectChildTextContent(
  parent: Element,
  firstTag: string,
  ...rest: string[]
): string | undefined {
  // Find direct child with firstTag
  let target: Element | null = null;
  for (let i = 0; i < parent.children.length; i++) {
    if (parent.children[i].tagName === firstTag || parent.children[i].localName === firstTag) {
      target = parent.children[i];
      break;
    }
  }
  if (!target) return undefined;

  for (const tag of rest) {
    if (!target) return undefined;
    const children = target.getElementsByTagName(tag);
    if (children.length === 0) return undefined;
    target = children[0];
  }

  return target?.textContent?.trim() ?? undefined;
}
