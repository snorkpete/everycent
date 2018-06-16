import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { switchMap } from "rxjs/operators";
import { AllocationCategoryData } from "../budgets/allocation.model";
import { MessageService } from "../message-display/message.service";
import { MainToolbarService } from "../shared/main-toolbar/main-toolbar.service";
import { AllocationCategoryEditFormComponent } from "./allocation-category-edit-form.component";
import { SetupService } from "./setup.service";

@Component({
  selector: "ec-account-categories",
  template: `
    <mat-card class="main">
      <mat-card>
        <mat-card-title>Allocation Categories</mat-card-title>
        <mat-card-content>
          <mat-list>
            <ng-container *ngFor="let category of allocationCategories">
              <mat-list-item>
                <div class="list-item-with-action-buttons">
                  <span> {{ category.name }} </span>
                  <button mat-raised-button color="primary" (click)="viewDetails(category)">Edit</button>
                </div>
              </mat-list-item>
              <mat-divider></mat-divider>
            </ng-container>
          </mat-list>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="addAllocationCategory()">Add Allocation Category</button>
          <button mat-raised-button (click)="refresh()">Refresh</button>
        </mat-card-actions>
      </mat-card>
    </mat-card>
  `,
  styles: []
})
export class AllocationCategoriesComponent implements OnInit {
  allocationCategories: AllocationCategoryData[] = [];

  constructor(
    private setupService: SetupService,
    private dialog: MatDialog,
    private toolbar: MainToolbarService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.setupService
      .getAllocationCategories()
      .subscribe(
        allocationCategories =>
          (this.allocationCategories = allocationCategories)
      );
  }

  viewDetails(allocationCategory: AllocationCategoryData) {
    let dialogRef = this.dialog.open(AllocationCategoryEditFormComponent, {});

    const form = dialogRef.componentInstance;
    form.allocationCategory = allocationCategory;
    form.save
      .pipe(
        switchMap(updatedAllocationCategory =>
          this.setupService.createOrUpdateAllocationCategory(
            updatedAllocationCategory
          )
        )
      )
      .subscribe(
        () => {
          this.messageService.setMessage("Allocation Category saved.");
          this.refresh();
          dialogRef.close();
        },
        error => {
          this.messageService.setErrorMessage("Allocation Category not saved.");
          this.refresh();
        }
      );
  }

  addAllocationCategory() {
    this.viewDetails({ id: 0, name: "" });
  }
}
