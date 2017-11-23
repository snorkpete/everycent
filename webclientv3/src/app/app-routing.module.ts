import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {AuthGuard} from './core/auth/auth-guard.service';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', redirectTo: 'login' },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {path: '', component: HomeComponent},
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {useHash: true}),
  ],
  exports: [
    RouterModule,
  ]

})
export class AppRoutingModule {}
