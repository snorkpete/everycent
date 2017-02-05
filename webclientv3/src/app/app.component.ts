import { Component } from '@angular/core';

@Component({
  selector: 'ec-root',
  styles: [`
  `],
  template: `
    Hello from trinidad {{ title }}
  `,
})
export class AppComponent {
  title = 'ec works!';
}
