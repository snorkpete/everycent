import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialEventsRoutingModule } from './special-events-routing.module';
import { SpecialEventsComponent } from './special-events.component';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { SetupService } from '../setup/setup.service';

@NgModule({
  declarations: [
    SpecialEventsComponent
  ],
  imports: [
    CommonModule,
    SpecialEventsRoutingModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatDividerModule
  ],
  providers: [SetupService]
})
export class SpecialEventsModule { }
