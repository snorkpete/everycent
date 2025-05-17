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
          <mat-list>
            <ng-container *ngFor="let event of specialEvents">
              <mat-list-item>
                <div class="list-item-with-action-buttons">
                  <div class="event-details">
                    <span class="event-name">{{ event.name }}</span>
                    <div class="event-amount-container">
                      <span class="event-amount">Budget: {{ event.budget_amount | ecMoney }}</span>
                      <span class="event-amount">Actual: {{ event.actual_amount | ecMoney }}</span>
                    </div>
                  </div>
                  <div class="action-buttons">
                    <button mat-raised-button color="primary" (click)="viewDetails(event)">View Details</button>
                    <button mat-icon-button color="warn" (click)="deleteEvent(event)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </mat-list-item>
              <mat-divider></mat-divider>
            </ng-container>
          </mat-list>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="openAddDialog()">Add Special Event</button>
          <button mat-raised-button (click)="refresh()">Refresh</button>
        </mat-card-actions>
      </mat-card>
    </mat-card>
  `,
  styles: [
    `
      .event-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .event-name {
        font-size: 16px;
        font-weight: 500;
      }
      .event-amount-container {
        display: flex;
        flex-direction: row;
        gap: 10px;
      }
      .event-amount {
        color: rgba(0, 0, 0, 0.54);
      }
      .list-item-with-action-buttons {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
      .action-buttons {
        display: flex;
        gap: 8px;
        align-items: center;
      }
    `
  ]
})
export class SpecialEventsComponent implements OnInit {
  specialEvents: SpecialEventData[] = [];

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
