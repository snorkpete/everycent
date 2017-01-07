import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {CardComponent} from "./card.component";
import {LoadingIndicatorComponent} from "./loading-indicator.component";
import {MessageDisplayComponent} from "./message-display.component";
import {RouterModule} from "@angular/router";
import {ToDollarsPipe} from "./to-dollars.pipe";
import {ToolbarComponent} from "./toolbar.component";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {FormattedAmountComponent} from "./formatted-amount-component";
import {MaterialModule} from "@angular/material/module";
import {FlexLayoutModule} from "@angular/flex-layout";
import {DeleteButtonComponent} from "./delete-button.component";
import {MoneyFieldComponent} from "./money-field.component";

@NgModule({
    imports: [
        CommonModule,
        MaterialModule.forRoot(),
        FlexLayoutModule.forRoot(),
        FormsModule, ReactiveFormsModule,
    ],
    declarations:[
        CardComponent,
        FormattedAmountComponent,
        LoadingIndicatorComponent,
        MessageDisplayComponent,
        ToolbarComponent,
        DeleteButtonComponent,
        MoneyFieldComponent,

        ToDollarsPipe,
    ],
    exports: [
        CardComponent,
        FormattedAmountComponent,
        LoadingIndicatorComponent,
        MessageDisplayComponent,
        ToolbarComponent,

        MoneyFieldComponent,
        DeleteButtonComponent,

        ToDollarsPipe,

        // Re-export common angular modules
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,

        // re-export the material design modules
        MaterialModule,
        FlexLayoutModule,
    ]
})
export class SharedModule{}
