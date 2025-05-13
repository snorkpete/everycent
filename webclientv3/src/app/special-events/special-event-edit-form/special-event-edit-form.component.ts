import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { SelectionModel } from '@angular/cdk/collections';
import { BudgetService } from '../../budgets/budget.service';
import { BudgetData } from '../../budgets/budget.model';
import { AllocationCategoryData, AllocationData } from '../../budgets/allocation.model';
import { SpecialEventData } from '../../setup/special-events.component';
import { SetupService } from '../../setup/setup.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ec-special-event-edit-form',
  template: `
    <mat-card class="main">
      <mat-card>
        <mat-card-title>{{ specialEvent?.name }}</mat-card-title>
        <mat-card-content>
          <table mat-table [dataSource]="specialEvent?.allocations" class="mat-elevation-z8">
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let allocation">{{ allocation.name }}</td>
            </ng-container>

            <!-- Amount Column -->
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let allocation">{{ allocation.amount | ecMoney }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="['name', 'amount']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['name', 'amount'];"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-title>Assign Allocations to {{ specialEvent?.name }}</mat-card-title>
        <mat-card-content>
          <form [formGroup]="form">
            <div class="filter-row">
              <mat-form-field>
                <mat-select placeholder="Select Budget" formControlName="budget_id">
                  <mat-option *ngFor="let budget of budgets" [value]="budget.id">
                    {{ budget.name }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field>
                <mat-select placeholder="Filter by Category" formControlName="allocation_category_id">
                  <mat-option [value]="null">All Categories</mat-option>
                  <mat-option *ngFor="let category of allocationCategories" [value]="category.id">
                    {{ category.name }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <table mat-table [dataSource]="groupedAllocations" [multiTemplateDataRows]="true" class="mat-elevation-z8">
              <!-- Checkbox Column -->
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-checkbox
                    (change)="$event ? toggleAllAllocations() : null"
                    [checked]="allocationSelection.hasValue() && isAllSelected()"
                    [indeterminate]="allocationSelection.hasValue() && !isAllSelected()">
                  </mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let allocation">
                  <mat-checkbox
                    (click)="$event.stopPropagation()"
                    (change)="$event ? toggleAllocation(allocation) : null"
                    [checked]="allocationSelection.isSelected(allocation)">
                  </mat-checkbox>
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let allocation">{{ allocation.name }}</td>
              </ng-container>

              <!-- Amount Column -->
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let allocation">{{ allocation.amount | ecMoney }}</td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let allocation">{{ allocation.allocation_category?.name }}</td>
              </ng-container>

              <!-- Category Header Row -->
              <ng-container matColumnDef="categoryHeader">
                <td mat-cell *matCellDef="let category" colspan="4" class="category-header">
                  {{ category.name }}
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let category; columns: ['categoryHeader']; when: isCategoryRow"></tr>
              <tr mat-row *matRowDef="let allocation; columns: displayedColumns; when: isAllocationRow"></tr>
            </table>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="save()">Save</button>
          <button mat-raised-button (click)="cancel()">Cancel</button>
        </mat-card-actions>
      </mat-card>
    </mat-card>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }
    .filter-row {
      display: flex;
      gap: 16px;
    }
    .filter-row .mat-form-field {
      flex: 1;
    }
    .mat-table {
      width: 100%;
    }
    .mat-column-select {
      width: 48px;
      text-align: center;
    }
    .mat-column-name {
      flex: 2;
    }
    .mat-column-amount {
      flex: 1;
      text-align: right;
    }
    .mat-column-category {
      flex: 1;
    }
    .category-header {
      font-weight: bold;
      background-color: #f5f5f5;
      padding: 8px 16px;
    }
  `]
})
export class SpecialEventEditFormComponent implements OnInit, OnDestroy {
  specialEvent: SpecialEventData;
  budgets: BudgetData[] = [];
  allocations: AllocationData[] = [];
  allocationCategories: AllocationCategoryData[] = [];
  groupedAllocations: any[] = [];
  displayedColumns: string[] = ['select', 'name', 'amount', 'category'];
  allocationSelection = new SelectionModel<AllocationData>(true, []);
  private componentDestroyed = new Subject();

  form: FormGroup<{
    budget_id: FormControl<number>;
    allocation_category_id: FormControl<number | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private setupService: SetupService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      budget_id: [0],
      allocation_category_id: [null as number | null]
    });

    this.loadBudgets();
    this.loadAllocationCategories();

    // Load special event data and URL parameters
    this.route.params.pipe(takeUntil(this.componentDestroyed)).subscribe(params => {
      if (params['id']) {
        this.setupService.getSpecialEvents().subscribe(specialEvents => {
          this.specialEvent = specialEvents.find(event => event.id === +params['id']);
          if (this.specialEvent?.allocations) {
            this.allocationSelection.select(...this.specialEvent.allocations);
          }
        });
      }
    });

    // Subscribe to form changes and update URL
    this.form.valueChanges.pipe(takeUntil(this.componentDestroyed)).subscribe(() => {
      const budgetId = this.form.get('budget_id').value;
      if (budgetId) {
        this.loadAllocations(budgetId);
      } else {
        this.allocations = [];
        this.groupedAllocations = [];
      }

      // Update URL with current form values
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          budget_id: this.form.get('budget_id').value,
          allocation_category_id: this.form.get('allocation_category_id').value
        },
        queryParamsHandling: 'merge'
      });
    });

    // Load initial values from URL
    this.route.queryParams.pipe(takeUntil(this.componentDestroyed)).subscribe(params => {
      const budgetId = Number(params['budget_id']) || 0;
      const categoryId = params['allocation_category_id'] ? Number(params['allocation_category_id']) : null;
      
      this.form.patchValue({
        budget_id: budgetId,
        allocation_category_id: categoryId
      });
    });
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  loadBudgets() {
    this.budgetService.getBudgets().subscribe(budgets => {
      this.budgets = budgets;
    });
  }

  loadAllocations(budgetId: number) {
    this.budgetService.getBudget(budgetId).subscribe(budget => {
      this.allocations = budget.allocations;
      this.groupAllocationsByCategory();
    });
  }

  loadAllocationCategories() {
    this.budgetService.getAllocationCategories().subscribe(allocationCategories => {
      this.allocationCategories = allocationCategories;
    });
  }

  groupAllocationsByCategory() {
    const categories = new Map<string, any>();
    const selectedCategoryId = this.form.get('allocation_category_id').value;
    
    // Filter allocations by selected category if one is selected
    const filteredAllocations = selectedCategoryId
      ? this.allocations.filter(allocation => allocation.allocation_category_id === selectedCategoryId)
      : this.allocations;

    // Add uncategorized allocations first
    const uncategorizedAllocations = filteredAllocations.filter(allocation => !allocation.allocation_category_id);
    if (uncategorizedAllocations.length > 0) {
      categories.set('Uncategorized', {
        name: 'Uncategorized',
        allocations: uncategorizedAllocations
      });
    }

    // Add categorized allocations
    this.allocationCategories.forEach(allocationCategory => {
      const categoryName = allocationCategory.name;
      const allocations = filteredAllocations.filter(allocation => allocation.allocation_category_id === allocationCategory.id);
      if (allocations.length > 0) {
        categories.set(categoryName, {
          name: categoryName,
          allocations: allocations
        });
      }
    });

    // Convert to array and flatten for table display
    this.groupedAllocations = Array.from(categories.values()).reduce((acc, category) => {
      acc.push(category);
      acc.push(...category.allocations);
      return acc;
    }, []);
  }

  isCategoryRow = (index: number, item: any) => item.name && !item.amount;
  isAllocationRow = (index: number, item: any) => !item.name || item.amount;

  isAllSelected() {
    const numSelected = this.allocationSelection.selected.length;
    const numRows = this.allocations.length;
    return numSelected === numRows;
  }

  toggleAllAllocations() {
    if (this.isAllSelected()) {
      this.allocationSelection.clear();
    } else {
      this.allocationSelection.select(...this.allocations);
    }
  }

  toggleAllocation(allocation: AllocationData) {
    this.allocationSelection.toggle(allocation);
  }

  save() {
    // TODO: Implement save functionality
    console.log('Selected allocations:', this.allocationSelection.selected);
  }

  cancel() {
    // TODO: Implement cancel functionality
    console.log('Cancel clicked');
  }
} 