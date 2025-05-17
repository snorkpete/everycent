import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialEventsRoutingModule } from './special-events-routing.module';
import { SpecialEventsComponent } from './special-events.component';
import { SpecialEventComponent } from './special-event/special-event.component';
import { SpecialEventEditAllocationsComponent } from './special-event-edit-allocations/special-event-edit-allocations.component';
import { SpecialEventEditDetailsFormComponent } from './special-event-edit-details-form/special-event-edit-details-form.component';
import { SpecialEventsService } from './special-events.service';
import { SharedModule } from '../shared/shared.module';
import { SpecialEventsAllocationsTableComponent } from './special-events-allocations-table/special-events-allocations-table.component';

@NgModule({
  declarations: [
    SpecialEventsComponent,
    SpecialEventComponent,
    SpecialEventEditAllocationsComponent,
    SpecialEventEditDetailsFormComponent,
    SpecialEventsAllocationsTableComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    SpecialEventsRoutingModule
  ],
  providers: [
    SpecialEventsService
  ]
})
export class SpecialEventsModule { }
