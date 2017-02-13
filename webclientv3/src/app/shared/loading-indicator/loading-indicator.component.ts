import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ec-loading-indicator',
  styles: [`
    md-progress-bar{
        position: relative;
    }
  `],
  template: `
    <md-progress-bar color="accent" mode="indeterminate"></md-progress-bar>
  `
})
export class LoadingIndicatorComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
