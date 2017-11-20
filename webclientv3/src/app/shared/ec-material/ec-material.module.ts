import 'hammerjs';
import { NgModule } from '@angular/core';
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatButtonModule} from "@angular/material/button";
// import {MatCardModule} from "@angular/material/card";
// import {MatDialogModule} from "@angular/material/dialog";
import {MatIconModule} from "@angular/material/icon";
// import {MatInputModule} from "@angular/material/input";
// import {MatListModule} from "@angular/material/list";
// import {MatProgressBarModule} from "@angular/material/progress-bar";
// import {MatSelectModule} from "@angular/material/select";
// import {MatSidenavModule} from "@angular/material/sidenav";
// import {MatSlideToggleModule} from "@angular/material/slide-toggle";
// import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatToolbarModule} from "@angular/material/toolbar";


@NgModule({
  imports: [
    FlexLayoutModule,

    MatButtonModule,
    // MatCardModule,
    // MatDialogModule,
    MatIconModule,
    // MatInputModule,
    // MatListModule,
    // MatProgressBarModule,
    // MatSelectModule,
    // MatSidenavModule,
    // MatSlideToggleModule,
    // MatSnackBarModule,
    MatToolbarModule,
  ],
  exports: [
    FlexLayoutModule,

    MatButtonModule,
    // MatCardModule,
    // MatDialogModule,
    MatIconModule,
    // MatInputModule,
    // MatListModule,
    // MatProgressBarModule,
    // MatSelectModule,
    // MatSidenavModule,
    // MatSlideToggleModule,
    // MatSnackBarModule,
    MatToolbarModule,

  ]
})
export class EcMaterialModule { }
