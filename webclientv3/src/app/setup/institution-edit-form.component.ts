import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { InstitutionData } from "../bank-accounts/institution.model";

@Component({
  selector: "ec-institution-edit-form",
  template: `
    <h1 mat-dialog-title>Institution Details</h1>
    <div mat-dialog-content>
      <div [formGroup]="form">
        <ec-text-field [(editMode)]="editMode" formControlName="name" placeholder="Name"></ec-text-field>
      </div>
    </div>
    <div mat-dialog-actions>
      <ec-edit-actions [(editMode)]="editMode"
                       (save)="saveChanges()"
                       (cancel)="cancelChanges()"
      >
        <button *ngIf="!editMode" mat-raised-button color="warn" (click)="cancelChanges()">Close</button>
      </ec-edit-actions>
    </div>
  `,
  styles: []
})
export class InstitutionEditFormComponent implements OnInit {
  @Input() institution: InstitutionData = {};
  @Output() save = new EventEmitter<InstitutionData>();
  @Output() cancel = new EventEmitter();
  editMode = true;

  form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<InstitutionEditFormComponent>
  ) {}

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
