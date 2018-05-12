import { Injectable } from '@angular/core';
import {MatDialog} from "@angular/material";
import {ConfirmationComponent} from "./confirmation/confirmation.component";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";

export interface ConfirmationConfig {
  title?: string;
  question?: string;
  emitNegativeAnswers?: boolean;
}

@Injectable()
export class ConfirmationService {

  private defaultConfig: ConfirmationConfig = {
    title: 'Are you sure?',
    question: 'Are you sure?',
    emitNegativeAnswers: true
  };

  constructor(
    private dialog: MatDialog
  ) { }

  ask(confirmationConfig: ConfirmationConfig): Observable<boolean> {
    let config = Object.assign({}, this.defaultConfig, confirmationConfig);
    let dialogRef = this.dialog.open(ConfirmationComponent);
    dialogRef.componentInstance.title = config.title;
    dialogRef.componentInstance.question = config.question;

    if (config.emitNegativeAnswers) {
      return dialogRef.afterClosed();
    } else {
      return dialogRef.afterClosed().pipe(filter(response => response));
    }
  }
}
