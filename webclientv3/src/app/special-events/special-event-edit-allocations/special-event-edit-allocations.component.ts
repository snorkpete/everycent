import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatTable} from '@angular/material/table';
import {BudgetService} from '../../budgets/budget.service';
import {BudgetData} from '../../budgets/budget.model';
import {AllocationCategoryData, AllocationData} from '../../budgets/allocation.model';
import {SpecialEventsService} from '../special-events.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MessageService} from '../../message-display/message.service';
import {LoadingIndicator} from '../../shared/loading-indicator/loading-indicator.service';
import { SpecialEventData } from '../special-event-data.model';

@Component({
  selector: 'ec-special-event-edit-allocations',
  template: `
    <mat-card class="main">
      <mat-card>
        <mat-card-title>{{ specialEvent?.name }}</mat-card-title>
        <mat-card-subtitle>
          Budgeted: {{ specialEvent?.budget_amount | ecMoney }} |
          <span class="highlighted">*</span>Actual: {{ calculateActualAmount() | ecMoney }}
        </mat-card-subtitle>
        <mat-card-content>
          <h3>Allocations</h3>
          <ec-special-events-allocations-table
            [allocations]="specialEvent?.allocations"
            [showActionColumn]="true"
            [actionButtonIcon]="'delete'"
            [actionButtonColor]="'warn'"
            (action)="removeAllocation($event)">
          </ec-special-events-allocations-table>
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

            <table mat-table #addNewAllocationsTable [dataSource]="groupedAllocations" [multiTemplateDataRows]="true" class="mat-elevation-z1">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let allocation">{{ allocation.name }}</td>
              </ng-container>

              <!-- Amount Column -->
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Budgeted</th>
                <td mat-cell *matCellDef="let allocation">{{ allocation.amount | ecMoney }}</td>
              </ng-container>

              <!-- Spent Column -->
              <ng-container matColumnDef="spent">
                <th mat-header-cell *matHeaderCellDef>Spent</th>
                <td mat-cell *matCellDef="let allocation">{{ allocation.spent | ecMoney }}</td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let allocation">{{ allocation.allocation_category?.name }}</td>
              </ng-container>

              <!-- Add Column -->
              <ng-container matColumnDef="add">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let allocation">
                  <button mat-icon-button color="primary" (click)="addAllocation(allocation)" [disabled]="isAllocationAssigned(allocation)">
                    <mat-icon>add_circle</mat-icon>
                  </button>
                </td>
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
    .mat-column-name {
      flex: 2;
    }
    .mat-column-amount {
      flex: 1;
      text-align: right;
    }
    .mat-column-spent {
      flex: 1;
      text-align: right;
    }
    .mat-column-category {
      flex: 1;
    }
    .mat-column-add, .mat-column-remove {
      width: 48px;
      text-align: center;
    }
    .category-header {
      font-weight: bold;
      background-color: #f5f5f5;
      padding: 8px 16px;
    }
    .highlighted {
      color: red;
    }
  `]
})
export class SpecialEventEditAllocationsComponent implements OnInit, OnDestroy {
  @ViewChild('specialEventAllocationsTable') specialEventAllocationsTable: MatTable<any>;
  @ViewChild('addNewAllocationsTable') addNewAllocationsTable: MatTable<any>;
  specialEvent: SpecialEventData;
  budgets: BudgetData[] = [];
  allocations: AllocationData[] = [];
  allocationCategories: AllocationCategoryData[] = [];
  groupedAllocations: any[] = [];
  displayedColumns: string[] = ['name', 'amount', 'spent', 'add'];
  private componentDestroyed = new Subject();

  form: FormGroup<{
    budget_id: FormControl<number>;
    allocation_category_id: FormControl<number | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private specialEventsService: SpecialEventsService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private loadingIndicator: LoadingIndicator
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      budget_id: 0,
      allocation_category_id: 0,
    });

    this.loadBudgets();
    this.loadAllocationCategories();

    // Load special event data and URL parameters
    this.route.params.pipe(takeUntil(this.componentDestroyed)).subscribe(params => {
      if (params['id']) {
        const id = Number(params['id']);
        this.specialEventsService.getSpecialEvent(id).subscribe(specialEvent => {
          this.specialEvent = specialEvent;
          if (!this.specialEvent.allocations) {
            this.specialEvent.allocations = [];
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

  isAllocationAssigned(allocation: AllocationData): boolean {
    return this.specialEvent?.allocations?.some(a => a.id === allocation.id) || false;
  }

  addAllocation(allocation: AllocationData) {
    if (!this.specialEvent.allocations) {
      this.specialEvent.allocations = [];
    }
    if (!this.isAllocationAssigned(allocation)) {
      this.specialEvent.allocations.push(allocation);
      this.specialEventAllocationsTable?.renderRows();
    }
  }

  removeAllocation(allocation: AllocationData) {
    if (this.specialEvent.allocations) {
      this.specialEvent.allocations = this.specialEvent.allocations.filter(a => a.id !== allocation.id);
      this.specialEventAllocationsTable?.renderRows();
    }
  }

  calculateActualAmount(): number {
    if (!this.specialEvent?.allocations) {
      return 0;
    }
    return this.specialEvent.allocations.reduce((sum, allocation) => sum + (allocation.spent || 0), 0);
  }

  save() {
    this.loadingIndicator.show();
    const allocationIds = this.specialEvent.allocations.map(allocation => allocation.id);

    this.specialEventsService.updateSpecialEventAllocations(this.specialEvent.id, {
      allocation_ids: allocationIds,
      actual_amount: this.calculateActualAmount()
    }).subscribe({
      next: (updatedEvent) => {
        this.loadingIndicator.hide();
        this.specialEvent = updatedEvent;
        this.messageService.setMessage('Special event updated successfully.', 5000);
      },
      error: (error) => {
        this.loadingIndicator.hide();
        this.messageService.setMessage('Error updating special event.', 5000);
        console.error('Error updating special event:', error);
      }
    });
  }

  cancel() {
    this.router.navigate(['/special-events', this.specialEvent.id]);
  }
}
