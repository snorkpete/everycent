import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { MediaObserver } from "@angular/flex-layout";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subscription } from "rxjs";
import { SharedTransactionService } from "../../shared-transactions/shared-transaction.service";
import { DeactivateService } from "../../shared/deactivate-button/deactivate.service";
import { Icon } from "../../shared/ec-icon/icon.type";
import { CompactTransactionListComponent } from "../../shared-transactions/compact-transaction-list/compact-transaction-list.component";
import { AddTransferFormComponent } from "../add-transfer-form/add-transfer-form.component";
import { SinkFundAllocationData } from "../sink-fund-allocation-data.model";
import { SinkFundCalculator } from "../sink-fund-calculator.service";
import { SinkFundData } from "../sink-fund-data.model";
import { SinkFundService } from "../sink-fund.service";

@Component({
  selector: "ec-sink-fund",
  styles: [
    `
      div.fixed {
        width: 100%;
        overflow-x: auto;
      }

      table.table {
        table-layout: fixed;
        width: 100%;
      }

      table.table.small-screen {
        width: 768px;
      }

      .highlight {
        font-weight: bold;
        font-size: 13px;
      }

      .total {
        font-weight: bold;
        font-size: 16px;
        border-top: 2px solid black;
        border-bottom: 2px solid black;
      }

      ec-icon.small ::ng-deep .material-icons {
        font-size: 16px;
        height: 16px;
        width: 16px;
        padding-top: 1px;
        cursor: pointer;
      }
    `
  ],
  template: `
    <mat-card>
      <mat-card-content>
        <mat-slide-toggle [(ngModel)]="showDeactivated" color="primary"
          >Show Closed Obligations?</mat-slide-toggle
        >
        <div class="fixed">
          <table
            *ngIf="sinkFund"
            class="table"
            [class.small-screen]="isSmallScreen"
          >
            <thead>
              <tr>
                <th [style.width.%]="25">Goal / Obligation</th>
                <th [style.width.%]="10">Current Balance</th>
                <th [style.width.%]="10">Target</th>

                <th [style.width.%]="10">Outstanding</th>
                <th [style.width.%]="20">Comment</th>
                <th [style.width.%]="5">Status</th>
                <th [style.width.%]="10">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr class="total">
                <td>Sink Fund Account Balance</td>
                <td>
                  <ec-money-field
                    [value]="sinkFund.current_balance"
                  ></ec-money-field>
                </td>
                <td></td>

                <td></td>
                <td>Current Account Balance</td>
                <td></td>
                <td></td>
              </tr>

              <tr class="total">
                <td>Unassigned Money</td>
                <td>
                  <ec-money-field
                    [value]="calculator.unassignedBalance(sinkFund)"
                  ></ec-money-field>
                </td>
                <td></td>

                <td></td>
                <td>Money not assigned to any financial goal/obligation</td>
                <td></td>
                <td></td>
              </tr>

              <ng-container
                *ngFor="let allocation of sinkFund.sink_fund_allocations"
              >
                <tr
                  *ngIf="
                    deactivateService.isItemVisible(allocation, showDeactivated)
                  "
                  [ecHighlightDeletedFor]="allocation"
                >
                  <td>
                    <ec-text-field
                      [(ngModel)]="allocation.name"
                      [editMode]="isEditMode"
                    ></ec-text-field>
                  </td>
                  <td class="highlight">
                    <div fxLayout="row" fxLayoutAlign="start center">
                      <ec-icon
                        [icon]="Icon.SHOW_TRANSACTIONS"
                        (click)="showTransactionsFor(allocation)"
                        class="small"
                      >
                      </ec-icon>
                      <span fxFlex></span>
                      <div class="right">
                        <ec-money-field
                          [value]="allocation.current_balance"
                        ></ec-money-field>
                      </div>
                    </div>
                  </td>
                  <td class="right">
                    <ec-money-field
                      [(ngModel)]="allocation.target"
                      [editMode]="isEditMode"
                    ></ec-money-field>
                  </td>
                  <td class="right">
                    <ec-money-field
                      [value]="
                        allocation.target == 0
                          ? 0
                          : allocation.current_balance - allocation.target
                      "
                      highlightPositive="true"
                    >
                    </ec-money-field>
                  </td>
                  <td>
                    <ec-text-field
                      [(ngModel)]="allocation.comment"
                      [editMode]="isEditMode"
                    ></ec-text-field>
                  </td>
                  <td>
                    <ec-text-field
                      [(ngModel)]="allocation.status"
                    ></ec-text-field>
                  </td>
                  <td>
                    <ec-delete-button
                      [item]="allocation"
                      [editMode]="isEditMode"
                    ></ec-delete-button>
                    <ec-deactivate-button
                      [item]="allocation"
                      [editMode]="isEditMode"
                    ></ec-deactivate-button>
                  </td>
                </tr>
              </ng-container>
            </tbody>

            <tfoot>
              <tr class="total">
                <td>Total</td>
                <td>
                  <ec-money-field
                    [value]="calculator.totalAssignedBalance(sinkFund)"
                  ></ec-money-field>
                </td>
                <td>
                  <ec-money-field
                    [value]="calculator.totalTarget(sinkFund, showDeactivated)"
                  ></ec-money-field>
                </td>

                <td>
                  <ec-money-field
                    [value]="
                      calculator.totalOutstanding(sinkFund, showDeactivated)
                    "
                  ></ec-money-field>
                </td>

                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </mat-card-content>
      <mat-card-actions>
        <ec-edit-actions
          [(editMode)]="isEditMode"
          (save)="save()"
          (cancel)="cancel()"
        >
          <button
            mat-raised-button
            color="accent"
            *ngIf="isEditMode"
            (click)="addObligation()"
          >
            Add Obligation
          </button>

          <button
            mat-raised-button
            color="primary"
            *ngIf="!isEditMode"
            (click)="showTransferForm()"
          >
            Transfer Money
          </button>
        </ec-edit-actions>
      </mat-card-actions>
    </mat-card>
  `
})
export class SinkFundComponent implements OnInit, OnDestroy {
  Icon = Icon;
  @Input() sinkFund: SinkFundData;

  calculator: SinkFundCalculator;

  isSmallScreen: boolean;
  isEditMode = false;
  showDeactivated = false;
  mediaSubscription: Subscription;

  constructor(
    private media: MediaObserver,
    private sinkFundService: SinkFundService,
    private transactionService: SharedTransactionService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    public deactivateService: DeactivateService
  ) {}

  ngOnInit() {
    this.calculator = new SinkFundCalculator(this.deactivateService);
    this.sinkFund = { sink_fund_allocations: [] };

    this.mediaSubscription = this.media.asObservable().subscribe(() => {
      this.isSmallScreen = this.media.isActive("xs");
    });
  }

  save() {
    this.sinkFundService.save(this.sinkFund).subscribe(
      result => {
        this.sinkFund = result;
        this.isEditMode = false;
        this.snackbar.open("Sink fund saved", null, { duration: 3000 });
      },
      error => {
        this.snackbar.open("Not saved: " + JSON.stringify(error), null, {
          duration: 3000
        });
      }
    );
  }

  cancel() {
    this.snackbar.open("Sink fund not saved", null, { duration: 1000 });
  }

  isAllocationVisible(allocation: any) {}

  showTransferForm() {
    let dialogRef = this.dialog.open(AddTransferFormComponent, {
      width: "350px"
    });
    dialogRef.componentInstance.sinkFund = this.sinkFund;
    dialogRef.afterClosed().subscribe(isSaved => {
      if (isSaved) {
        this.snackbar.open("Transfer complete.", null, { duration: 3000 });
      } else {
        this.snackbar.open("Transfer cancelled.", null, { duration: 1500 });
      }
    });
  }

  showTransactionsFor(sinkFundAllocation: SinkFundAllocationData) {
    let dialogRef: MatDialogRef<CompactTransactionListComponent>;
    this.transactionService
      .getTransactionsForSinkFundAllocation(sinkFundAllocation.id)
      .subscribe(transactions => {
        dialogRef = this.dialog.open(CompactTransactionListComponent, {
          width: "500px"
        });
        dialogRef.componentInstance.transactions = transactions;
        dialogRef.componentInstance.itemName = sinkFundAllocation.name;
      });
  }

  addObligation() {
    this.sinkFund.sink_fund_allocations.push({
      amount: 0,
      current_balance: 0,
      target: 0,
      unsaved: true
    });
  }

  ngOnDestroy() {
    this.mediaSubscription.unsubscribe();
  }
}
