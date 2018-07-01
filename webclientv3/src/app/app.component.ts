import { Component, OnInit } from "@angular/core";

@Component({
  selector: "ec-root",
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
      }
  `
  ],
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
