import type { InstitutionData } from '../../app/institutions/institution.types';

export function buildInstitution(overrides?: Partial<InstitutionData>): InstitutionData {
  return {
    id: 1,
    name: 'ABN AMRO',
    ...overrides,
  };
}
