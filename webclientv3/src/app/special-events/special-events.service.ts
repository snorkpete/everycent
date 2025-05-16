import { Injectable } from '@angular/core';
import { ApiGateway } from '../../api/api-gateway.service';
import { Observable } from 'rxjs';
import { SpecialEventData } from '../setup/special-events.component';

export interface SpecialEvent {
  id: number;
  name: string;
  budget_amount: number;
  actual_amount: number;
  budget_id: number;
  allocations: Array<{
    id: number;
    name: string;
    amount: number;
    allocation_category_id: number;
    allocation_category: {
      id: number;
      name: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class SpecialEventsService {
  constructor(private apiGateway: ApiGateway) {}

  getSpecialEvents(): Observable<SpecialEventData[]> {
    return this.apiGateway.get('/special_events');
  }

  getSpecialEvent(id: number): Observable<SpecialEventData> {
    return this.apiGateway.get(`/special_events/${id}`);
  }

  createSpecialEvent(specialEvent: Partial<SpecialEventData>): Observable<SpecialEventData> {
    return this.apiGateway.post('/special_events', { special_event: specialEvent });
  }

  updateSpecialEvent(id: number, specialEvent: Partial<SpecialEventData>): Observable<SpecialEventData> {
    return this.apiGateway.put(`/special_events/${id}`, { special_event: specialEvent });
  }

  updateSpecialEventAllocations(id: number, allocations: { allocation_ids: number[], actual_amount: number }): Observable<SpecialEventData> {
    return this.apiGateway.put(`/special_events/${id}/allocations`, { special_event: allocations });
  }

  deleteSpecialEvent(id: number): Observable<void> {
    return this.apiGateway.delete(`/special_events/${id}`);
  }
} 