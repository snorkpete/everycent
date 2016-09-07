import {Component, OnInit} from "@angular/core";
import {ApiGateway} from "../core/api-gateway.service";
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
export class HomeComponent implements OnInit{
  lastUpdate = new Date();

  constructor(
    private apiGateway: ApiGateway
  ){}

  ngOnInit(): void {
    this.getLastUpdate();
  }

  getLastUpdate(){
    let url = '/transactions/last_update';
    return this.apiGateway.get(url).subscribe(
      transaction => { this.lastUpdate = transaction.transaction_date; console.log(transaction)}
    );
  }
}
