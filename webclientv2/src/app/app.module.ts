
import {NgModule} from "@angular/core";
import {AppComponent} from "./app.component";
import {BrowserModule} from "@angular/platform-browser";
import {HttpModule} from "@angular/http";
import {SharedModule} from "./shared/shared.module";
import {CoreModule} from "./core/core.module";

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule, HttpModule,
        CoreModule,
        SharedModule,
    ],
    bootstrap: [AppComponent]
})
export class AppModule{ }
