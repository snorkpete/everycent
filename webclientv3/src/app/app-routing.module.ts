import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';


const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', redirectTo: 'login' },
  { path: '', component: HomeComponent },
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
