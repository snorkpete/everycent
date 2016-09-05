
import {Routes, RouterModule} from "@angular/router";
import {ModuleWithProviders} from "@angular/core";
import {LoginComponent} from "./auth/login.component";
import {HomeComponent} from "./home/home.component";

const appRoutes: Routes = [
  { path: 'login',  component: LoginComponent },
  { path: '',  component: HomeComponent }
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, {useHash:true});
