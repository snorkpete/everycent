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
        <li>Implement mass editing of allocations across multiple budgets</li>
        <li>Implement mass editing of incomes across multiple budgets</li>
      </ul>

      <h3>Note</h3>
      <div>
        All important features from the 'Old version' have now been implemented.
        There should be no need to go back to the old version. <br/>
        Please report if there is anything missing from the new version
      </div>

      <h3>Still outstanding</h3>
      <ul>
        <li>Allow adding of new incomes/allocations when editing across multiple budgets</li>
        <li>Implement 'Big Ticket Item Budgeting'</li>
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
