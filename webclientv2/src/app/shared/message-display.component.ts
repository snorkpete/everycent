import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {MessageService} from "../core/message.service";

@Component({
  styles:[`
    .INFO{
        background-color: lightblue;
    }
    .ERROR{
        background-color: red;
    }
    .WARNING{
        background-color: orange;
    }
    
  `],
  selector: 'ec-message-display',
  template: `
    <div [class]="class$ | async">
        Message: {{ messageText$ | async }}
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
    this.class$ = this.messageService.message$.map(m => m.type);
  }
}
