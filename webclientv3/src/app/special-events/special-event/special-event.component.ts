import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SpecialEventsService } from '../special-events.service';
import { SpecialEventData } from '../special-event-data.model';
import { AllocationData } from '../../transactions/allocation-data.model';
import { MessageService } from '../../message-display/message.service';
import { LoadingIndicator } from '../../shared/loading-indicator/loading-indicator.service';
import { MatDialog } from '@angular/material/dialog';
import { SpecialEventEditDetailsFormComponent } from '../special-event-edit-details-form/special-event-edit-details-form.component';

@Component({
  selector: 'ec-special-event',
  template: `
    <mat-card class="main">
      <mat-card>
        <mat-card-title>{{ specialEvent?.name }}</mat-card-title>
        <mat-card-subtitle>
          Budgeted: {{ specialEvent?.budget_amount | ecMoney }} |
          Actual: {{ specialEvent?.actual_amount | ecMoney }}
        </mat-card-subtitle>
        <mat-card-content>
          <table mat-table [dataSource]="allocations" class="mat-elevation-z8">
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

            <!-- Spent Column -->
            <ng-container matColumnDef="spent">
              <th mat-header-cell *matHeaderCellDef>Spent</th>
              <td mat-cell *matCellDef="let allocation">{{ allocation.spent | ecMoney }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="adjustAllocations()">Adjust Allocations</button>
          <button mat-raised-button color="accent" (click)="edit()">Edit Details</button>
          <button mat-raised-button (click)="refresh()">Refresh</button>
        </mat-card-actions>
      </mat-card>
    </mat-card>
  `,
  styles: [`
    .mat-table {
      width: 100%;
      margin-top: 16px;
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
  `]
})
export class SpecialEventComponent implements OnInit {
  specialEvent: SpecialEventData;
  allocations: AllocationData[] = [];
  displayedColumns: string[] = ['name', 'amount', 'spent'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private specialEventsService: SpecialEventsService,
    private messageService: MessageService,
    private loadingIndicator: LoadingIndicator,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadSpecialEvent(id);
      }
    });
  }

  loadSpecialEvent(id: number) {
    this.loadingIndicator.show();
    this.specialEventsService.getSpecialEvent(id).subscribe({
      next: (event) => {
        this.loadingIndicator.hide();
        this.specialEvent = event;
        this.allocations = event.allocations ?? [];
      },
      error: (error) => {
        this.loadingIndicator.hide();
        this.messageService.setMessage('Error loading special event.', 5000);
        console.error('Error loading special event:', error);
      }
    });
  }

  refresh() {
    if (this.specialEvent) {
      this.loadSpecialEvent(this.specialEvent.id);
    }
  }

  adjustAllocations() {
    this.router.navigate(['allocations'], { relativeTo: this.route });
  }

  edit() {
    const dialogRef = this.dialog.open(SpecialEventEditDetailsFormComponent, {
      width: '400px',
      data: this.specialEvent
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingIndicator.show();
        this.specialEventsService.updateSpecialEvent(this.specialEvent.id, result).subscribe({
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
    });
  }
}
