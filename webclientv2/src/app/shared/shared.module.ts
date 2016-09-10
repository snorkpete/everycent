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
import {MessageDisplayComponent} from "./message-display.component";
import {RouterModule} from "@angular/router";
import {MdListModule} from "@angular2-material/list";
import {ToDollarsPipe} from "./to-dollars.pipe";
import {ToolbarComponent} from "./toolbar.component";
import {MdCheckboxModule} from "@angular2-material/checkbox";
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
    imports: [CommonModule, MdCardModule, MdToolbarModule, MdIconModule],
    declarations:[
        CardComponent,
        ToolbarComponent,
        LoadingIndicatorComponent,
        MessageDisplayComponent,
        ToDollarsPipe
    ],
    exports: [
        CardComponent,
        ToolbarComponent,
        LoadingIndicatorComponent,
        MessageDisplayComponent,
        ToDollarsPipe,

        // Re-export the common module
        CommonModule,

        // Re-export the form module
        ReactiveFormsModule,
        RouterModule,

        // re-export the material design modules
        MdCoreModule,
        MdInputModule, MdRippleModule, MdSidenavModule, MdIconModule,
        MdListModule, MdToolbarModule, MdButtonModule, MdCardModule,
        MdCheckboxModule
    ]
})
export class SharedModule{}
