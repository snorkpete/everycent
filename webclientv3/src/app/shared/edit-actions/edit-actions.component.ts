import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'ec-edit-actions',
  template: `
    <div>
        <button md-raised-button color="primary" class="make-changes"
                *ngIf="!editMode"
                (click)="switchToEditMode()">
            Make Changes
        </button>

        <div fxLayout="row" fxLayoutAlign="end">

            <button md-raised-button color="primary" class="save"
                    *ngIf="editMode"
                    (click)="save.emit()">
                Save Changes
            </button>
            
            <button md-raised-button color="warn" class="cancel"
                    *ngIf="editMode"
                    (click)="cancelEdit()">
                Cancel
            </button>
            
        </div>
        
        
    </div>
  `,
  styles: []
})
export class EditActionsComponent implements OnInit {

  @Input() editMode = false;
  @Output() editModeChange = new EventEmitter();
  @Output() save = new EventEmitter();
  @Output() cancel = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  switchToEditMode() {
    this.editMode = true;
    this.editModeChange.emit(this.editMode);
  }

  cancelEdit() {
    this.editMode = false;
    this.editModeChange.emit(this.editMode);
    this.cancel.emit();
  }

}
