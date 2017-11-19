import { Component, OnInit } from '@angular/core';
import {LoadingIndicator} from './loading-indicator.service';

@Component({
  selector: 'ec-loading-indicator',
  styles: [`
    mat-progress-bar{
        position: relative;
    }
  `],
  template: `

    <mat-progress-bar color="accent" mode="indeterminate" class="loader" *ngIf="loadingIndicator.isVisible()">
    </mat-progress-bar>
  `
})
export class LoadingIndicatorComponent implements OnInit {

  constructor(
    public loadingIndicator: LoadingIndicator
  ) { }

  ngOnInit() {
  }

}
