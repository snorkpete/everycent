import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { SpecialEventsComponent } from './special-events.component';
import { SpecialEventComponent } from './special-event/special-event.component';
import { SpecialEventEditFormComponent } from './special-event-edit-form/special-event-edit-form.component';

const routes: Routes = [
  {
    path: '',
    component: SpecialEventsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    component: SpecialEventComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':id/edit',
    component: SpecialEventEditFormComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpecialEventsRoutingModule { } 