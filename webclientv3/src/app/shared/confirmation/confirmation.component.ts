import {Component, Input, OnInit} from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'ec-confirmation',
  template: `
    <h1 mat-dialog-title>{{title}}</h1>
    <div mat-dialog-content>
      {{question}}
    </div>
    <div mat-dialog-actions>
      <div class="actions" fxLayout="row" fxLayoutAlign="space-around">
        <button mat-raised-button color="primary" (click)="yes()">Yes</button>
        <button mat-raised-button color="warn" (click)="no()">No</button>
      </div>
    </div>
  `,
  styles: []
})
export class ConfirmationComponent implements OnInit {

  @Input() title = 'Are you sure?';
  @Input() question = 'Are you sure?';

  constructor(
    public dialogRef: MatDialogRef<ConfirmationComponent>
  ) { }

  ngOnInit() {
  }

  yes() {
    this.dialogRef.close(true);
  }

  no() {
    this.dialogRef.close(false);
  }
}
