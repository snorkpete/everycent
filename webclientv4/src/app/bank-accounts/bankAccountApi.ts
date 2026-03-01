import apiGateway from '../../api/api-gateway';
import type { BankAccountData, InstitutionData } from './bankAccount.types';

export const bankAccountApi = {
  getAll: () =>
    apiGateway
      .get<BankAccountData[]>('/bank_accounts', { params: { include_closed: true } })
      .then((r) => r.data),

  getInstitutions: () =>
    apiGateway.get<InstitutionData[]>('/institutions').then((r) => r.data),

  create: (account: BankAccountData) =>
    apiGateway.post<BankAccountData>('/bank_accounts', account).then((r) => r.data),

  update: (account: BankAccountData & { id: number }) =>
    apiGateway
      .put<BankAccountData>(`/bank_accounts/${account.id}`, account)
      .then((r) => r.data),
};
