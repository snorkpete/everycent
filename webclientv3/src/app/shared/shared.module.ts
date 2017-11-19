import 'hammerjs';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MainToolbarComponent} from './main-toolbar/main-toolbar.component';
import {LoadingIndicatorComponent} from './loading-indicator/loading-indicator.component';
import {MessageDisplayComponent} from './message-display/message-display.component';
import {MenuComponent} from './menu/menu.component';
import {LoadingIndicator} from './loading-indicator/loading-indicator.service';
import {RouterModule} from '@angular/router';
import {AppRoutingModule} from '../app-routing.module';
import {MainToolbarService} from './main-toolbar/main-toolbar.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MessageService} from '../message-display/message.service';
import {AuthService} from './auth/auth.service';
import {EcIconComponent} from './ec-icon/ec-icon.component';
import {AuthGuard} from './auth/auth-guard.service';
import {MenuItemComponent} from './menu/menu-item.component';
import {FormFieldComponent} from './form/form-field/form-field.component';
import {TextFieldComponent} from './form/text-field/text-field.component';
import {MoneyPipe} from './money.pipe';
import {MoneyFieldComponent} from './form/money-field/money-field.component';
import {DateFieldComponent} from './form/date-field/date-field.component';
import {EditActionsComponent} from './edit-actions/edit-actions.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DeleteButtonComponent} from './delete-button/delete-button.component';
import {HighlightDeletedDirective} from './highlight-deleted.directive';
import {DeactivateButtonComponent} from "./deactivate-button/deactivate-button.component";
import {DeactivateService} from "./deactivate-button/deactivate.service";
import {EcMaterialModule} from "./ec-material/ec-material.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    RouterModule,
    AppRoutingModule,
    EcMaterialModule,
  ],
  declarations: [
    MainToolbarComponent,
    LoadingIndicatorComponent,
    MessageDisplayComponent,
    MenuComponent,
    EcIconComponent,
    MenuItemComponent,

    TextFieldComponent,
    DateFieldComponent,
    MoneyFieldComponent,
    FormFieldComponent,
    MoneyPipe,
    EditActionsComponent,
    DeleteButtonComponent,
    DeactivateButtonComponent,
    HighlightDeletedDirective,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    EcMaterialModule,

    MainToolbarComponent,
    LoadingIndicatorComponent,
    MessageDisplayComponent,
    MenuComponent,

    EcIconComponent,
    TextFieldComponent,
    DateFieldComponent,
    MoneyFieldComponent,
    FormFieldComponent,
    MoneyPipe,
    EditActionsComponent,
    DeleteButtonComponent,
    DeactivateButtonComponent,
    HighlightDeletedDirective,

    AppRoutingModule,
  ],
  providers: [
    LoadingIndicator,
    MainToolbarService,
    MessageService,
    AuthService,
    AuthGuard,
    DeactivateService,
  ]
})
export class SharedModule { }
