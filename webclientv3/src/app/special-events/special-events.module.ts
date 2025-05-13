import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialEventsRoutingModule } from './special-events-routing.module';
import { SpecialEventsComponent } from './special-events.component';
import { SpecialEventComponent } from './special-event/special-event.component';
import { SetupService } from '../setup/setup.service';
import { SharedModule } from '../shared/shared.module';
import { SpecialEventEditFormComponent } from './special-event-edit-form/special-event-edit-form.component';
@NgModule({
  declarations: [
    SpecialEventsComponent,
    SpecialEventComponent,
    SpecialEventEditFormComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    SpecialEventsRoutingModule,
  ],
  providers: [SetupService]
})
export class SpecialEventsModule { }
