import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ConfirmationService} from "./confirmation.service";

import {EcMaterialModule} from "./ec-material/ec-material.module";

import {DeactivateButtonComponent} from "./deactivate-button/deactivate-button.component";
import {DeactivateService} from "./deactivate-button/deactivate.service";
import {DeleteButtonComponent} from './delete-button/delete-button.component';
import {EcIconComponent} from './ec-icon/ec-icon.component';
import {EditActionsComponent} from './edit-actions/edit-actions.component';
import {DateFieldComponent} from './form/date-field/date-field.component';
import {FormFieldComponent} from './form/form-field/form-field.component';
import {MoneyFieldComponent} from './form/money-field/money-field.component';
import {TextFieldComponent} from './form/text-field/text-field.component';
import {HighlightDeletedDirective} from './highlight-deleted.directive';
import {LoadingIndicatorComponent} from './loading-indicator/loading-indicator.component';
import {LoadingIndicator} from './loading-indicator/loading-indicator.service';
import {MainToolbarComponent} from './main-toolbar/main-toolbar.component';
import {MainToolbarService} from './main-toolbar/main-toolbar.service';
import {MenuItemComponent} from './menu/menu-item.component';
import {MenuComponent} from './menu/menu.component';
import {MessageDisplayComponent} from './message-display/message-display.component';
import {MessageService} from '../message-display/message.service';
import {MoneyPipe} from './money.pipe';
import { PaidFieldComponent } from './form/paid-field/paid-field.component';
import { ListFieldComponent } from './form/list-field/list-field.component';
import {SettingsService} from "./settings.service";
import { ConfirmationComponent } from './confirmation/confirmation.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    EcMaterialModule,
  ],
  declarations: [
    DateFieldComponent,
    DeactivateButtonComponent,
    DeleteButtonComponent,
    EcIconComponent,
    EditActionsComponent,
    FormFieldComponent,
    HighlightDeletedDirective,
    LoadingIndicatorComponent,
    ListFieldComponent,
    MainToolbarComponent,
    MessageDisplayComponent,
    MenuComponent,
    MenuItemComponent,
    MoneyFieldComponent,
    MoneyPipe,
    PaidFieldComponent,
    TextFieldComponent,
    ConfirmationComponent,
  ],
  entryComponents: [
    ConfirmationComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    EcMaterialModule,

    DateFieldComponent,
    DeactivateButtonComponent,
    DeleteButtonComponent,
    EcIconComponent,
    EditActionsComponent,
    FormFieldComponent,
    HighlightDeletedDirective,
    ListFieldComponent,
    LoadingIndicatorComponent,
    MainToolbarComponent,
    MenuComponent,
    MessageDisplayComponent,
    MoneyFieldComponent,
    MoneyPipe,
    PaidFieldComponent,
    TextFieldComponent,
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        ConfirmationService,
        DeactivateService,
        LoadingIndicator,
        MainToolbarService,
        MessageService,
        SettingsService,
      ],
    };
  }
}
