import apiGateway from '../../api/api-gateway';
import type { BankAccountData, AccountTransferData } from './bankAccount.types';

export const bankAccountApi = {
  getAll: () =>
    apiGateway
      .get<BankAccountData[]>('/bank_accounts', { params: { include_closed: true } })
      .then((r) => r.data),

  create: (account: BankAccountData) =>
    apiGateway.post<BankAccountData>('/bank_accounts', account).then((r) => r.data),

  update: (account: BankAccountData & { id: number }) =>
    apiGateway.put<BankAccountData>(`/bank_accounts/${account.id}`, account).then((r) => r.data),

  // Open accounts, sorted by account_category_order (current accounts first,
  // then alphabetical within category). Use this for dropdowns/selection UI —
  // the main current account appears first and becomes the natural default.
  getOpen: () => apiGateway.get<BankAccountData[]>('/bank_accounts').then((r) => r.data),

  // Open accounts only, with computed current_balance, sorted alphabetically
  // (NO category ordering). For the Account Balances screen. Don't use for
  // dropdowns — the sort order is wrong and there's unnecessary balance load.
  getWithBalances: () =>
    apiGateway
      .get<BankAccountData[]>('/bank_accounts', { params: { include_current_balance: true } })
      .then((r) => r.data),

  transfer: (fromId: number, data: AccountTransferData) =>
    apiGateway.post<void>(`/bank_accounts/${fromId}/transfer`, data).then((r) => r.data),
};
