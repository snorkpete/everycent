import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpecialEventsRoutingModule } from './special-events-routing.module';
import { SpecialEventsComponent } from './special-events.component';


@NgModule({
  declarations: [
    SpecialEventsComponent
  ],
  imports: [
    CommonModule,
    SpecialEventsRoutingModule
  ]
})
export class SpecialEventsModule { }
