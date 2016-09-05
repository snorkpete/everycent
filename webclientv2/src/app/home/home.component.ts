import {Component} from "@angular/core";
@Component({
  selector: 'ec-home',
  template: `
    <h2> Welcome to EveryCent!!!</h2>

    <div class="text-right">
        <strong> Last transaction date entered: </strong>
        <span class="label label-primary">
            {{ lastUpdate | date:long }}
        </span>
    </div>

    <br/>
  `
})
export class HomeComponent{
  lastUpdate = new Date();
}
