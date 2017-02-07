import {Component, OnInit} from '@angular/core';
import 'rxjs/add/operator/map';
import {ApiGateway} from '../api/api-gateway.service';

@Component({
  selector: 'ec-root',
  styles: [`
  `],
  template: `
    <h1>
      Hello from trinidad {{ title }}
    </h1>
  `,
})
export class AppComponent implements OnInit{
  title = 'ec works!';

  constructor(
  ) { }

  ngOnInit() {
  }
}
