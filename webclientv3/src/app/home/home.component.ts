import { Component, OnInit } from "@angular/core";
import { MainToolbarService } from "../shared/main-toolbar/main-toolbar.service";
import { HomeService } from "./home.service";

@Component({
  selector: "ec-home",
  template: `
    <mat-card class="main">
      <div class="last-update">
        <h1>Last Transaction Update</h1>
        <div>
          <strong>Last transaction entered:</strong>
          <span class="details">
            {{ lastUpdate.transaction_date | date:'fullDate' }}
          </span>
        </div>
      </div>

      <h1>Recent Updates and Fixes</h1>
      <ul>
        <li>Indicate that the Setup -> Bank Accounts isn't implemented yet</li>
        <li>Fix the Account Balances screen for new accounts</li>
      </ul>

      <h3>Still outstanding</h3>
      <ul>
        <li>Implement the Setup of Bank Accounts in the new version</li>
      </ul>
    </mat-card>
  `,
  styles: [
    `
      .last-update {
        margin: 15px;
        background-color: wheat;
        margin-left: 0;
        border: 3px solid grey;
        padding: 15px;
        border-radius: 10px;
      }

      .details {
        border-bottom: 1px solid black;
      }
  `
  ]
})
export class HomeComponent implements OnInit {
  public lastUpdate: any = "";

  constructor(
    private mainToolbarService: MainToolbarService,
    private homeService: HomeService
  ) {}

  ngOnInit() {
    this.mainToolbarService.showToolbar();

    this.homeService.getLastUpdate().subscribe(lastUpdate => {
      this.lastUpdate = lastUpdate;
    });
  }
}
