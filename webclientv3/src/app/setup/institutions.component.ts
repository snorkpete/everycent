import { Component, OnInit } from '@angular/core';
import {MatDialog} from "@angular/material";
import {InstitutionData} from "../bank-accounts/institution.model";
import {MessageService} from "../message-display/message.service";
import {MainToolbarService} from "../shared/main-toolbar/main-toolbar.service";
import {InstitutionEditFormComponent} from "./institution-edit-form.component";
import {SetupService} from "./setup.service";
import { switchMap } from "rxjs/operators";

@Component({
  selector: 'ec-institutions',
  styles: [`
  `],
  template: `
    <mat-card class="main">
      <mat-card>
        <mat-card-title>Financial Institutions</mat-card-title>
        <mat-card-content>
          <mat-list>
            <ng-container *ngFor="let institution of institutions">
              <mat-list-item>
                <div class="list-item-with-action-buttons">
                  <span> {{ institution.name }} </span>
                  <button mat-raised-button color="primary" (click)="viewDetails(institution)">View</button>
                </div>
              </mat-list-item>
              <mat-divider></mat-divider>
            </ng-container>
          </mat-list>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="addInstitution()">Add Institution</button>
          <button mat-raised-button (click)="refresh()">Refresh</button>
        </mat-card-actions>
      </mat-card>
    </mat-card>
  `,
})
export class InstitutionsComponent implements OnInit {

  institutions: InstitutionData[] = [];

  constructor(
    private setupService: SetupService,
    private dialog: MatDialog,
    private toolbar: MainToolbarService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.setupService.getInstitutions().subscribe(institutions => this.institutions = institutions);
  }

  viewDetails(institution: InstitutionData) {
    let dialogRef = this.dialog.open(InstitutionEditFormComponent, {

    });

    const form = dialogRef.componentInstance;
    form.institution = institution;
    form.save
        .switchMap(updatedInstitution => this.setupService.createOrUpdateInstitution(updatedInstitution))
        .subscribe(() => {
          this.messageService.setMessage('Institution saved.');
          this.refresh();
          dialogRef.close();
        }, error => {
          this.messageService.setErrorMessage('Institution not saved.');
          this.refresh();
        });
  }

  addInstitution() {
    this.viewDetails({ id: 0, name: '' });
  }
}
