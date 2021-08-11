import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { AllocationCategoryData } from "../budgets/allocation.model";

@Component({
  selector: "ec-account-category-edit-form",
  template: `
    <h1 mat-dialog-title>Allocation Category Details</h1>
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
export class AllocationCategoryEditFormComponent implements OnInit {
  @Input() allocationCategory: AllocationCategoryData = {};
  @Output() save = new EventEmitter<AllocationCategoryData>();
  @Output() cancel = new EventEmitter();
  editMode = true;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AllocationCategoryEditFormComponent>
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      id: this.allocationCategory.id,
      name: this.allocationCategory.name
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
