
import {Routes, RouterModule} from "@angular/router";
import {ModuleWithProviders} from "@angular/core";
import {LoginComponent} from "./auth/login.component";
import {AuthGuard} from "./auth/auth-guard.service";
import {RootComponent} from "./root/root.component";
import {HomeComponent} from "./root/home.component";

//export const appRoutes: Routes = [
export const appRoutes = [
  { path: 'login',  component: LoginComponent, menuDisplay: 'Login', menuIcon: '' },
  { path: '',
    component: RootComponent,
    canActivate: [AuthGuard],
    children:[
      { path: '', component: HomeComponent}
    ]
  }
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, {useHash:true});
