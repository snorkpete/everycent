import {NgModule, ModuleWithProviders} from "@angular/core";
import {CommonModule} from "@angular/common";
import {CardComponent} from "./card.component";
import {LoadingIndicatorComponent} from "./loading-indicator.component";
import {MessageDisplayComponent} from "./message-display.component";
import {RouterModule} from "@angular/router";
import {ToDollarsPipe} from "./to-dollars.pipe";
import {ToolbarComponent} from "./toolbar.component";
import {ReactiveFormsModule} from "@angular/forms";
import {FormattedAmountComponent} from "./formatted-amount-component";
import {MaterialModule} from "@angular/material/module";

@NgModule({
    imports: [
        CommonModule,
        MaterialModule.forRoot(),
    ],
    declarations:[
        CardComponent,
        FormattedAmountComponent,
        LoadingIndicatorComponent,
        MessageDisplayComponent,
        ToolbarComponent,

        ToDollarsPipe,
    ],
    exports: [
        CardComponent,
        FormattedAmountComponent,
        LoadingIndicatorComponent,
        MessageDisplayComponent,
        ToolbarComponent,

        ToDollarsPipe,

        // Re-export common angular modules
        CommonModule,
        ReactiveFormsModule,
        RouterModule,

        // re-export the material design modules
        MaterialModule,
    ]
})
export class SharedModule{}
