import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SinkFundsComponent} from './sink-funds.component';
import {AuthGuard} from '../shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'sink-funds', component: SinkFundsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class SinkFundsRoutingModule { }
