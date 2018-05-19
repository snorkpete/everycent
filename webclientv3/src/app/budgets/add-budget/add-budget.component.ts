import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { BudgetData } from "../budget.model";

@Component({
  selector: "ec-add-budget",
  template: `
    <h1 mat-dialog-title>Add New Budget</h1>
    <div mat-dialog-content>
      <div [formGroup]="form">
        <ec-date-field [editMode]="true" formControlName="start_date" placeholder="Start Date"></ec-date-field>
      </div>
    </div>
    <div mat-dialog-actions>
      <ec-edit-actions [editMode]="true"
                       (save)="saveChanges()"
                       (cancel)="cancelChanges()"
      >
      </ec-edit-actions>
    </div>
  `,
  styles: []
})
export class AddBudgetComponent implements OnInit {
  budget: BudgetData = {};
  @Output() save = new EventEmitter<BudgetData>();
  @Output() cancel = new EventEmitter();
  editMode = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddBudgetComponent>
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      start_date: this.budget.start_date
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
