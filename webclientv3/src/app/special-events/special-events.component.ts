import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpecialEventsService } from './special-events.service';
import { SpecialEventData } from './special-event-data.model';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../message-display/message.service';
import { LoadingIndicator } from '../shared/loading-indicator/loading-indicator.service';
import { SpecialEventEditDetailsFormComponent } from './special-event-edit-details-form/special-event-edit-details-form.component';

@Component({
  selector: 'ec-special-events',
  template: `
    <mat-card class="main">
      <mat-card>
        <mat-card-title>Special Events</mat-card-title>
        <mat-card-content>
          <table mat-table [dataSource]="specialEvents" class="mat-elevation-z1">
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let event">{{ event.name }}</td>
            </ng-container>

            <!-- Start Date Column -->
            <ng-container matColumnDef="start_date">
              <th mat-header-cell *matHeaderCellDef>Start Date</th>
              <td mat-cell *matCellDef="let event">{{ event.start_date | date }}</td>
            </ng-container>

            <!-- Budget Column -->
            <ng-container matColumnDef="budget">
              <th mat-header-cell *matHeaderCellDef>Budget</th>
              <td mat-cell *matCellDef="let event">{{ event.budget_amount | ecMoney }}</td>
            </ng-container>

            <!-- Amount Column -->
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Actual</th>
              <td mat-cell *matCellDef="let event">{{ event.actual_amount | ecMoney }}</td>
            </ng-container>

            <!-- Difference Column -->
            <ng-container matColumnDef="difference">
              <th mat-header-cell *matHeaderCellDef>Difference</th>
              <td mat-cell *matCellDef="let event">
                <ec-money-field [value]="calculateDifference(event)" [editMode]="false"></ec-money-field>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let event">
                <button mat-icon-button color="primary" (click)="viewDetails(event)" matTooltip="View">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteEvent(event)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="openAddDialog()">Add Special Event</button>
          <button mat-raised-button (click)="refresh()">Refresh</button>
        </mat-card-actions>
      </mat-card>
    </mat-card>
  `,
  styles: [`
    .mat-table {
      width: 100%;
    }
    .mat-column-name {
      flex: 2;
    }
    .mat-column-start_date {
      flex: 1;
    }
    .mat-column-budget {
      flex: 1;
      text-align: right;
    }
    .mat-column-amount {
      flex: 1;
      text-align: right;
    }
    .mat-column-difference {
      flex: 1;
      text-align: right;
    }
    .mat-column-actions {
      width: 100px;
      text-align: center;
    }
  `]
})
export class SpecialEventsComponent implements OnInit {
  specialEvents: SpecialEventData[] = [];
  displayedColumns: string[] = ['name', 'start_date', 'budget', 'amount', 'difference', 'actions'];

  constructor(
    private specialEventsService: SpecialEventsService,
    private router: Router,
    private dialog: MatDialog,
    private messageService: MessageService,
    private loadingIndicator: LoadingIndicator
  ) {}

  ngOnInit() {
    this.refresh();
  }

  calculateDifference(event: SpecialEventData): number {
    return (event.budget_amount || 0) - (event.actual_amount || 0);
  }

  refresh() {
    this.specialEventsService.getSpecialEvents()
      .subscribe(specialEvents => this.specialEvents = specialEvents);
  }

  viewDetails(event: SpecialEventData) {
    this.router.navigate(['/special-events', event.id]);
  }

  deleteEvent(event: SpecialEventData) {
    if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
      this.loadingIndicator.show();
      this.specialEventsService.deleteSpecialEvent(event.id).subscribe({
        next: () => {
          this.loadingIndicator.hide();
          this.messageService.setMessage('Special event deleted successfully.', 5000);
          this.refresh();
        },
        error: (error) => {
          this.loadingIndicator.hide();
          this.messageService.setMessage('Error deleting special event.', 5000);
          console.error('Error deleting special event:', error);
        }
      });
    }
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(SpecialEventEditDetailsFormComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingIndicator.show();
        this.specialEventsService.createSpecialEvent(result).subscribe({
          next: () => {
            this.loadingIndicator.hide();
            this.messageService.setMessage('Special event created successfully.', 5000);
            this.refresh();
          },
          error: (error) => {
            this.loadingIndicator.hide();
            this.messageService.setMessage('Error creating special event.', 5000);
            console.error('Error creating special event:', error);
          }
        });
      }
    });
  }
}
