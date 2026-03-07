import apiGateway from '../../api/api-gateway';
import type { AllocationCategoryData } from './allocationCategory.types';

export const allocationCategoryApi = {
  getAll: () =>
    apiGateway.get<AllocationCategoryData[]>('/allocation_categories').then((r) => r.data),

  create: (category: AllocationCategoryData) =>
    apiGateway.post<AllocationCategoryData>('/allocation_categories', category).then((r) => r.data),

  update: (category: AllocationCategoryData & { id: number }) =>
    apiGateway
      .put<AllocationCategoryData>(`/allocation_categories/${category.id}`, category)
      .then((r) => r.data),
};
