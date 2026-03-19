import apiGateway from '../../api/api-gateway';
import type { InstitutionData } from './institution.types';

export const institutionApi = {
  getAll: () =>
    apiGateway.get<InstitutionData[]>('/institutions').then((r) => r.data),

  create: (institution: InstitutionData) =>
    apiGateway.post<InstitutionData>('/institutions', institution).then((r) => r.data),

  update: (institution: InstitutionData & { id: number }) =>
    apiGateway
      .put<InstitutionData>(`/institutions/${institution.id}`, institution)
      .then((r) => r.data),
};
