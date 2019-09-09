import { Component, OnInit } from "@angular/core";

@Component({
  selector: "ec-reports",
  template: `
    <div>
      reports works!
      <ul>
        <li>
          <a [routerLink]="['net-worth']"> Net Worth Report</a>
        </li>
      </ul>
    </div>
  `,
  styles: []
})
export class ReportsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
