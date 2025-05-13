import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SetupService } from '../../setup/setup.service';
import { SpecialEventData } from '../../setup/special-events.component';
import { AllocationData } from '../../transactions/allocation-data.model';

@Component({
  selector: 'ec-special-event',
  template: `
    <mat-card class="main">
      <mat-card>
        <mat-card-title>{{ specialEvent?.name }}</mat-card-title>
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
              <td mat-cell *matCellDef="let allocation">{{ allocation.amount | currency }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="makeChanges()">Make Changes</button>
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
  `]
})
export class SpecialEventComponent implements OnInit {
  specialEvent: SpecialEventData;
  allocations: AllocationData[] = [];
  displayedColumns: string[] = ['name', 'amount'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private setupService: SetupService
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
    this.setupService.getSpecialEvents().subscribe(events => {
      this.specialEvent = events.find(event => event.id === +id);
      this.allocations = this.specialEvent.allocations ?? [];
      // TODO: Load allocations for this event
    //   this.allocations = [
    //     { id: 1, name: 'Sample Allocation 1', amount: 100, special_event_id: +id },
    //     { id: 2, name: 'Sample Allocation 2', amount: 200, special_event_id: +id }
    //   ];
    });
  }

  refresh() {
    // TODO: Implement refresh functionality
    console.log('Refresh clicked');
  }

  makeChanges() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }
} 