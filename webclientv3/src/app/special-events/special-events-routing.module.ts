import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpecialEventsComponent } from './special-events.component';
import { AuthGuard } from '../core/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: SpecialEventsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpecialEventsRoutingModule { }
