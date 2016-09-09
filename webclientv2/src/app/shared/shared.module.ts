import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {CardComponent} from "./card.component";
import {LoadingIndicatorComponent} from "./loading-indicator.component";
import {MdCardModule} from "@angular2-material/card";
import {MdToolbarModule} from "@angular2-material/toolbar";
import {MdInputModule} from "@angular2-material/input";
import {MdRippleModule, MdCoreModule} from "@angular2-material/core";
import {MdSidenavModule} from "@angular2-material/sidenav";
import {MdIconModule} from "@angular2-material/icon";
import {MdButtonModule} from "@angular2-material/button";
import {FormsModule} from "@angular/forms";
import {MessageDisplayComponent} from "./message-display.component";
import {RouterModule} from "@angular/router";
import {MdListModule} from "@angular2-material/list";

@NgModule({
    imports: [CommonModule, MdCardModule, MdToolbarModule, MdIconModule],
    declarations:[
        CardComponent,
        LoadingIndicatorComponent,
        MessageDisplayComponent
    ],
    exports: [
        CardComponent,
        LoadingIndicatorComponent,
        MessageDisplayComponent,

        // Re-export the common module
        CommonModule,

        // Re-export the form module
        FormsModule,
        RouterModule,

        // re-export the material design modules
        MdCoreModule,
        MdInputModule, MdRippleModule, MdSidenavModule, MdIconModule,
        MdListModule, MdToolbarModule, MdButtonModule, MdCardModule
    ]
})
export class SharedModule{}
