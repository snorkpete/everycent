
import {NgModule} from "@angular/core";
import {AppComponent} from "./app.component";
import {BrowserModule} from "@angular/platform-browser";
import {HttpModule} from "@angular/http";
import {SharedModule} from "./shared/shared.module";
import {CoreModule} from "./core/core.module";
import {routing, appRoutingProviders} from "./app.routing";
import {AuthModule} from "./auth/auth.module";
import {RootModule} from "./root/root.module";
import {AccountBalancesModule} from "./account-balances/account-balances.module";

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule, HttpModule, routing,
        CoreModule,
        SharedModule,
        AuthModule,
        RootModule,
        AccountBalancesModule
    ],
    bootstrap: [AppComponent],
    providers: [
      appRoutingProviders
    ]
})
export class AppModule{ }
