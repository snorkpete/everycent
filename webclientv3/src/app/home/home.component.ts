import { Component, OnInit } from '@angular/core';
import {MainToolbarService} from '../shared/main-toolbar/main-toolbar.service';

@Component({
  selector: 'ec-home',
  template: `
    Home
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
