import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {MatDialogRef} from "@angular/material";
import {InstitutionData} from "../bank-accounts/institution.model";

@Component({
  selector: 'ec-institution-edit-form',
  template: `
    <h1 mat-dialog-title>Institution Details</h1>
    <div mat-dialog-content>
      <div [formGroup]="form">
        <ec-text-field [editMode]="true" formControlName="name" placeholder="Name"></ec-text-field>
      </div>
    </div>
    <div mat-dialog-actions>
      <div class="actions" fxLayout="row" fxLayoutAlign="space-around">
        <button mat-raised-button color="primary" (click)="saveChanges()">Save</button>
        <button mat-raised-button color="warn" (click)="cancelChanges()">Cancel</button>
      </div>
    </div>
  `,
  styles: []
})
export class InstitutionEditFormComponent implements OnInit {

  @Input() institution: InstitutionData = {};
  @Output() save = new EventEmitter<InstitutionData>();
  @Output() cancel = new EventEmitter();

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<InstitutionEditFormComponent>
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      id: this.institution.id,
      name: this.institution.name
    });
  }

  saveChanges() {
    this.save.emit(this.form.value);
    this.save.complete();
  }

  cancelChanges() {
    this.cancel.emit();
    this.cancel.complete();
    this.dialogRef.close();
  }
}
