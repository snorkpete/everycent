import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { SpecialEventData } from "./special-events.component";

@Component({
  selector: "ec-special-event-edit-form",
  template: `
    <h1 mat-dialog-title>Special Event Details</h1>
    <div mat-dialog-content>
      <div [formGroup]="form">
        <ec-text-field [(editMode)]="editMode" formControlName="name" placeholder="Name"></ec-text-field>
        <ec-text-field [(editMode)]="editMode" formControlName="budget_amount" placeholder="Budget Amount" type="number"></ec-text-field>
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
export class SpecialEventEditFormComponent implements OnInit {
  @Input() specialEvent: SpecialEventData = { id: 0, name: "", budget_amount: 0 };
  @Output() save = new EventEmitter<SpecialEventData>();
  @Output() cancel = new EventEmitter();
  editMode = true;

  form: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<SpecialEventEditFormComponent>
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      id: this.specialEvent.id,
      name: this.specialEvent.name,
      budget_amount: this.specialEvent.budget_amount
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