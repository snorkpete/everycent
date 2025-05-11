import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { switchMap } from "rxjs/operators";
import { MessageService } from "../message-display/message.service";
import { MainToolbarService } from "../shared/main-toolbar/main-toolbar.service";
import { SpecialEventEditFormComponent } from "./special-event-edit-form.component";
import { SetupService } from "./setup.service";

export interface SpecialEventData {
  id: number;
  name: string;
  budget_amount: number;
}

@Component({
  selector: "ec-special-events",
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
                    <span class="event-amount">Budget: {{ event.budget_amount | currency }}</span>
                  </div>
                  <div class="action-buttons">
                    <button mat-raised-button color="primary" (click)="viewDetails(event)">Edit</button>
                    <button mat-raised-button color="warn" (click)="deleteEvent(event)">Delete</button>
                  </div>
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
      }
    `
  ]
})
export class SpecialEventsComponent implements OnInit {
  specialEvents: SpecialEventData[] = [];

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
      .getSpecialEvents()
      .subscribe(
        specialEvents =>
          (this.specialEvents = specialEvents)
      );
  }

  viewDetails(specialEvent: SpecialEventData) {
    const dialogRef = this.dialog.open(SpecialEventEditFormComponent, {
      data: { specialEvent }
    });

    const form = dialogRef.componentInstance;
    form.specialEvent = specialEvent;
    form.save
      .pipe(
        switchMap(updatedSpecialEvent =>
          this.setupService.createOrUpdateSpecialEvent(
            updatedSpecialEvent as SpecialEventData
          )
        )
      )
      .subscribe(
        () => {
          this.messageService.setMessage("Special Event saved.");
          this.refresh();
          dialogRef.close();
        },
        error => {
          this.messageService.setErrorMessage("Special Event not saved.");
          this.refresh();
        }
      );
  }

  deleteEvent(event: SpecialEventData) {
    if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
      this.setupService.deleteSpecialEvent(event.id).subscribe(
        () => {
          this.messageService.setMessage("Special Event deleted.");
          this.refresh();
        },
        error => {
          this.messageService.setErrorMessage("Failed to delete Special Event.");
        }
      );
    }
  }

  addSpecialEvent() {
    this.viewDetails({ id: 0, name: "", budget_amount: 0 });
  }
} 