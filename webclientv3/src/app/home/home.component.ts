import { Component, OnInit } from '@angular/core';
import {MainToolbarService} from '../shared/main-toolbar/main-toolbar.service';

@Component({
  selector: 'ec-home',
  template: `
    <h1>Recent Updates and Fixes</h1>
    <ul>
      <li>Implement the Future Budgets view</li>
      <li>Prevent adding transactions to future budgets</li>
    </ul>

    <h3>Still outstanding</h3>
    <ul>
      <li>
        Fix issue where the transaction summary shows the wrong amount after saving. <br/>
        The current workaround is to click 'Refresh' - this properly updates the transaction summary
      </li>
      <li>
        The Future Budgets view does not have an accurate total of allocations. Only a dummy value is supplied currently.
      </li>
      <li>
        Move the selection of the import format to part of the configuration of the account.
        By doing this, selecting an account will select the appropriate import format properly.
      </li>
    </ul>
  `,
  styles: []
})
export class HomeComponent implements OnInit {

  constructor(
    private mainToolbarService: MainToolbarService
  ) { }

  ngOnInit() {
    this.mainToolbarService.showToolbar();
  }

}
