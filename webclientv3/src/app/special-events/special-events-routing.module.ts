import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/auth/auth-guard.service';
import { SpecialEventsComponent } from './special-events.component';
import { SpecialEventComponent } from './special-event/special-event.component';
import { SpecialEventEditAllocationsComponent } from './special-event-edit-allocations/special-event-edit-allocations.component';
const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: SpecialEventsComponent },
      { path: ':id', component: SpecialEventComponent },
      { path: ':id/allocations', component: SpecialEventEditAllocationsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpecialEventsRoutingModule { }
