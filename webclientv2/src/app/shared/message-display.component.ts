import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {MessageService} from "../core/message.service";

@Component({
  styles:[`
    div.message-display{
      font-size: 20px;
      margin: 15px 25px;
      padding: 10px;
      border-radius: 5px;
      color: white;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); 
    }
    .INFO{
      background-color: #4f9c7c;
      border: 3px solid #232d29;
    }
    .ERROR{
      background-color: #9c2545;
      border: 3px solid #2d0b0c;
    }
    .WARNING{
      background-color: #9c6514;
      border: 3px solid #402909;
    }
    
  `],
  selector: 'ec-message-display',
  template: `
    <div class="message-display" [class]="class$ | async" *ngIf="messageText$ | async">
        {{ messageText$ | async }}
    </div>
  `
})
export class MessageDisplayComponent implements OnInit{
  messageText$: Observable<string>;
  class$: Observable<string>;

  constructor(
    private messageService: MessageService
  ){}

  ngOnInit(): void {
    this.messageText$ = this.messageService.message$.map(m => m.text);
    this.class$ = this.messageService.message$.map(m => 'message-display ' + m.type);
  }
}
