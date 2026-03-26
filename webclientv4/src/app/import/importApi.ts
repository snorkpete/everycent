import apiGateway from '../../api/api-gateway';
import type { PreviewResponse, SaveResponse } from './import.types';
import type { CamtAccountResult } from '../transactions/importers/camt053Parser';

export interface PreviewPayload {
  budget_id: number;
  bank_accounts: {
    bank_account_id: number;
    iban: string;
    transactions: {
      transaction_date: string;
      description: string;
      withdrawal_amount: number;
      deposit_amount: number;
      bank_ref: string;
      status: string;
    }[];
  }[];
}

export interface SavePayload {
  budget_id: number;
  bank_accounts: {
    bank_account_id: number;
    iban: string;
    transactions: {
      transaction_date: string;
      description: string;
      withdrawal_amount: number;
      deposit_amount: number;
      bank_ref: string;
      status: string;
      camt_imported: boolean;
      deleted: boolean;
      allocation_id: number | null;
    }[];
  }[];
}

export function buildPreviewPayload(
  budgetId: number,
  accounts: CamtAccountResult[],
): PreviewPayload {
  return {
    budget_id: budgetId,
    bank_accounts: accounts
      .filter((a) => a.bankAccountId != null)
      .map((a) => ({
        bank_account_id: a.bankAccountId!,
        iban: a.iban,
        transactions: a.transactions.map((t) => ({
          transaction_date: t.transaction_date ?? '',
          description: t.description ?? '',
          withdrawal_amount: t.withdrawal_amount ?? 0,
          deposit_amount: t.deposit_amount ?? 0,
          bank_ref: t.bank_ref ?? '',
          status: t.status ?? 'paid',
        })),
      })),
  };
}

export const importApi = {
  preview: (payload: PreviewPayload) =>
    apiGateway
      .post<PreviewResponse>('/transactions/import_preview', payload)
      .then((r) => r.data),

  save: (payload: SavePayload) =>
    apiGateway
      .post<SaveResponse>('/transactions/import_save', payload)
      .then((r) => r.data),
};
