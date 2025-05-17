import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AllocationData } from '../../budgets/allocation.model';
import { SharedTransactionService } from '../../shared-transactions/shared-transaction.service';
import { MatDialog } from '@angular/material/dialog';
import { CompactTransactionListComponent } from '../../shared-transactions/compact-transaction-list/compact-transaction-list.component';
import { Icon } from '../../shared/ec-icon/icon.type';

@Component({
  selector: 'ec-special-events-allocations-table',
  template: `
    <table mat-table [dataSource]="allocations" class="mat-elevation-z8">
      <!-- Name Column -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Allocation</th>
        <td mat-cell *matCellDef="let allocation">{{ allocation.name }}</td>
        <td mat-footer-cell *matFooterCellDef class="bold">Total</td>
      </ng-container>

      <!-- Budget Column -->
      <ng-container matColumnDef="budget">
        <th mat-header-cell *matHeaderCellDef>Budget</th>
        <td mat-cell *matCellDef="let allocation">{{ allocation.budget_name }}</td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>

      <!-- Category Column -->
      <ng-container matColumnDef="category">
        <th mat-header-cell *matHeaderCellDef>Category</th>
        <td mat-cell *matCellDef="let allocation">{{ allocation.allocation_category_name }}</td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>

      <!-- Amount Column -->
      <ng-container matColumnDef="amount">
        <th mat-header-cell *matHeaderCellDef>Amount</th>
        <td mat-cell *matCellDef="let allocation">{{ allocation.amount | ecMoney }}</td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>

      <!-- Spent Column -->
      <ng-container matColumnDef="spent">
        <th mat-header-cell *matHeaderCellDef>Spent</th>
        <td mat-cell *matCellDef="let allocation">
          <ec-icon
            [icon]="Icon.SHOW_TRANSACTIONS"
            (click)="showTransactionsFor(allocation)"
            class="small">
          </ec-icon>
          {{ allocation.spent | ecMoney }}
        </td>
        <td mat-footer-cell *matFooterCellDef>{{ totalSpent() | ecMoney }}</td>
      </ng-container>

      <!-- Action Column -->
      <ng-container matColumnDef="action" *ngIf="showActionColumn">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let allocation">
          <button mat-icon-button [color]="actionButtonColor" (click)="onAction(allocation)">
            <mat-icon>{{ actionButtonIcon }}</mat-icon>
          </button>
        </td>
        <td mat-footer-cell *matFooterCellDef></td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      <tr mat-footer-row *matFooterRowDef="displayedColumns" class="footer"></tr>
    </table>
  `,
  styles: [`
    .mat-table {
      width: 100%;
      margin-top: 16px;
    }
    .mat-column-name {
      flex: 2;
    }
    .mat-column-budget {
      flex: 1;
    }
    .mat-column-category {
      flex: 1;
    }
    .mat-column-amount {
      flex: 1;
      text-align: right;
    }
    .mat-column-spent {
      flex: 1;
      text-align: right;
    }
    .mat-column-action {
      width: 48px;
      text-align: center;
    }
    ec-icon.small ::ng-deep .material-icons {
      font-size: 16px;
      height: 16px;
      width: 16px;
      padding-top: 1px;
      cursor: pointer;
    }
    .footer {
      font-weight: bold;
      border-top: 2px solid grey;
    }
    .bold {
      font-weight: bold;
    }
  `]
})
export class SpecialEventsAllocationsTableComponent {
  Icon = Icon;
  @Input() allocations: AllocationData[] = [];
  @Input() showActionColumn = false;
  @Input() actionButtonIcon = 'add_circle';
  @Input() actionButtonColor = 'primary';
  @Output() action = new EventEmitter<AllocationData>();

  constructor(
    private transactionService: SharedTransactionService,
    private dialog: MatDialog
  ) {}

  get displayedColumns(): string[] {
    const columns = ['name', 'budget', 'category', 'amount', 'spent'];
    if (this.showActionColumn) {
      columns.push('action');
    }
    return columns;
  }

  onAction(allocation: AllocationData): void {
    this.action.emit(allocation);
  }

  showTransactionsFor(allocation: AllocationData): void {
    let dialogRef = this.dialog.open(CompactTransactionListComponent, {
      width: '500px'
    });
    
    this.transactionService.transactionsForAllocation(allocation.id)
      .subscribe(transactions => {
        dialogRef.componentInstance.transactions = transactions;
        dialogRef.componentInstance.itemName = allocation.name;
      });
  }

  totalSpent(): number {
    return this.allocations.reduce((sum, allocation) => sum + (allocation.spent || 0), 0);
  }
} 