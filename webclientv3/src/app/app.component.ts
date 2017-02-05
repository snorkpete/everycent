import {Component, OnInit} from '@angular/core';
import 'rxjs/add/operator/map';
import {ApiGateway} from '../api/api-gateway.service';

@Component({
  selector: 'ec-root',
  styles: [`
  `],
  template: `
    Hello from trinidad {{ title }}
  `,
})
export class AppComponent implements OnInit{
  title = 'ec works!';
  result: any;

  constructor(
    private apiGateway: ApiGateway
  ) { }

  ngOnInit() {
    this.apiGateway.test();
  }
}
