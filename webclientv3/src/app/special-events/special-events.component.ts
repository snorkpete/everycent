import { Component, OnInit } from '@angular/core';
import { SetupService } from "../setup/setup.service";
import { SpecialEventData } from "../setup/special-events.component";
import { Router } from '@angular/router';

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
                  <button mat-raised-button color="primary" (click)="viewDetails(event)">View Details</button>
                </div>
              </mat-list-item>
              <mat-divider></mat-divider>
            </ng-container>
          </mat-list>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="addSpecialEvent()">Add Special Event</button>
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
    `
  ]
})
export class SpecialEventsComponent implements OnInit {
  specialEvents: SpecialEventData[] = [];

  constructor(
    private setupService: SetupService,
    private router: Router
  ) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.setupService
      .getSpecialEvents()
      .subscribe(
        specialEvents =>
          (this.specialEvents = specialEvents)
      );
  }

  viewDetails(event: SpecialEventData) {
    this.router.navigate(['/special-events', event.id]);
  }

  addSpecialEvent() {
    this.router.navigate(['/setup/special-events']);
  }
}
