
import {NgModule} from "@angular/core";
import {AppComponent} from "./app.component";
import {BrowserModule} from "@angular/platform-browser";
import {HttpModule} from "@angular/http";
import {SharedModule} from "./shared/shared.module";
import {CoreModule} from "./core/core.module";
import {LoginComponent} from "./auth/login.component";
import {HomeComponent} from "./home/home.component";
import {routing, appRoutingProviders} from "./app.routing";
import {MenuComponent} from "./menu/menu.component";

@NgModule({
    declarations: [
        AppComponent,
        MenuComponent,
        LoginComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule, HttpModule, routing,
        CoreModule,
        SharedModule,
    ],
    bootstrap: [AppComponent],
    providers: [
      appRoutingProviders
    ]
})
export class AppModule{ }
