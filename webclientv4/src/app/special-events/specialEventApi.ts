import apiGateway from '../../api/api-gateway';
import type { SpecialEventData } from './specialEvent.types';

export const specialEventApi = {
  getAll: () =>
    apiGateway.get<SpecialEventData[]>('/special_events').then((r) => r.data),

  getOne: (id: number) =>
    apiGateway.get<SpecialEventData>(`/special_events/${id}`).then((r) => r.data),

  create: (data: Partial<SpecialEventData>) =>
    apiGateway
      .post<SpecialEventData>('/special_events', { special_event: data })
      .then((r) => r.data),

  update: (id: number, data: Partial<SpecialEventData>) =>
    apiGateway
      .put<SpecialEventData>(`/special_events/${id}`, { special_event: data })
      .then((r) => r.data),

  delete: (id: number) =>
    apiGateway.delete<void>(`/special_events/${id}`).then((r) => r.data),

  updateAllocations: (
    id: number,
    data: { allocation_ids: number[]; actual_amount: number },
  ) =>
    apiGateway
      .put<SpecialEventData>(`/special_events/${id}/allocations`, {
        special_event: data,
      })
      .then((r) => r.data),
};
