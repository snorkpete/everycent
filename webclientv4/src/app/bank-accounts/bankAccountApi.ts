import apiGateway from '../../api/api-gateway';
import type { BankAccountData, InstitutionData, AccountTransferData } from './bankAccount.types';

export const bankAccountApi = {
  getAll: () =>
    apiGateway
      .get<BankAccountData[]>('/bank_accounts', { params: { include_closed: true } })
      .then((r) => r.data),

  getInstitutions: () => apiGateway.get<InstitutionData[]>('/institutions').then((r) => r.data),

  create: (account: BankAccountData) =>
    apiGateway.post<BankAccountData>('/bank_accounts', account).then((r) => r.data),

  update: (account: BankAccountData & { id: number }) =>
    apiGateway.put<BankAccountData>(`/bank_accounts/${account.id}`, account).then((r) => r.data),

  getOpen: () => apiGateway.get<BankAccountData[]>('/bank_accounts').then((r) => r.data),

  getWithBalances: () =>
    apiGateway
      .get<BankAccountData[]>('/bank_accounts', { params: { include_current_balance: true } })
      .then((r) => r.data),

  transfer: (fromId: number, data: AccountTransferData) =>
    apiGateway.post<void>(`/bank_accounts/${fromId}/transfer`, data).then((r) => r.data),
};
