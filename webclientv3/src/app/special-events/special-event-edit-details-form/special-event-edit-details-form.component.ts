import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SpecialEventData } from '../special-event-data.model';

@Component({
  selector: 'ec-special-event-edit-details-form',
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit' : 'Add' }} Special Event</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <ec-text-field [(editMode)]="editMode" formControlName="name" placeholder="Name"></ec-text-field>
        <ec-money-field [(editMode)]="editMode" formControlName="budget_amount" placeholder="Budget Amount"></ec-money-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!form.valid">
          {{ data ? 'Save' : 'Add' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class SpecialEventEditDetailsFormComponent {
  form: FormGroup;
  editMode = true;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SpecialEventEditDetailsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SpecialEventData
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      budget_amount: [data?.budget_amount || 0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
} 