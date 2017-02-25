import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SinkFundsComponent} from './sink-funds.component';

const routes: Routes = [
  { path: 'sink-funds', component: SinkFundsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class SinkFundsRoutingModule { }