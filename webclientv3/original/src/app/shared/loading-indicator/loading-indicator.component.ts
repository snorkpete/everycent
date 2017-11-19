import { Component, OnInit } from '@angular/core';
import {LoadingIndicator} from './loading-indicator.service';

@Component({
  selector: 'ec-loading-indicator',
  styles: [`
    md-progress-bar{
        position: relative;
    }
  `],
  template: `

    <md-progress-bar color="accent" mode="indeterminate" class="loader" *ngIf="loadingIndicator.isVisible()">
    </md-progress-bar>
  `
})
export class LoadingIndicatorComponent implements OnInit {

  constructor(
    public loadingIndicator: LoadingIndicator
  ) { }

  ngOnInit() {
  }

}
