import { Component, OnInit } from "@angular/core";
import { MainToolbarService } from "../shared/main-toolbar/main-toolbar.service";

@Component({
  selector: "ec-home",
  template: `
    <mat-card class="main">
      <h1>Recent Updates and Fixes</h1>
      <ul>
        <li>Implement the Future Budgets view</li>
        <li>Prevent adding transactions to future budgets</li>
        <li>Fix issue where the transaction summary shows wrong amount after saving.</li>
      </ul>

      <h3>Still outstanding</h3>
      <ul>
        <li>
          Move the selection of the import format to part of the configuration of the account.
          By doing this, selecting an account will select the appropriate import format properly.
        </li>
      </ul>
    </mat-card>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  constructor(private mainToolbarService: MainToolbarService) {}

  ngOnInit() {
    this.mainToolbarService.showToolbar();
  }
}
