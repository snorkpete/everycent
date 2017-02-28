import 'hammerjs';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MaterialModule} from '@angular/material';
import { MainToolbarComponent } from './main-toolbar/main-toolbar.component';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { MessageDisplayComponent } from './message-display/message-display.component';
import { MenuComponent } from './menu/menu.component';
import {LoadingIndicator} from './loading-indicator/loading-indicator.service';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RouterModule} from '@angular/router';
import {AppRoutingModule} from '../app-routing.module';
import {MainToolbarService} from './main-toolbar/main-toolbar.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MessageService} from '../message-display/message.service';
import {AuthService} from './auth/auth.service';
import { EcIconComponent } from './ec-icon/ec-icon.component';
import {AuthGuard} from './auth/auth-guard.service';
import { MenuItemComponent } from './menu/menu-item.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule.forRoot(),
    RouterModule,
    FlexLayoutModule,
    AppRoutingModule,
  ],
  declarations: [
    MainToolbarComponent,
    LoadingIndicatorComponent,
    MessageDisplayComponent,
    MenuComponent,
    EcIconComponent,
    MenuItemComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,

    MainToolbarComponent,
    LoadingIndicatorComponent,
    MessageDisplayComponent,
    MenuComponent,

    AppRoutingModule,
  ],
  providers: [
    LoadingIndicator,
    MainToolbarService,
    MessageService,
    AuthService,
    AuthGuard,
  ]
})
export class SharedModule { }
