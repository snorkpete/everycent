import { Component, OnInit } from '@angular/core';
import {MessageService, MessageType} from '../../message-display/message.service';

@Component({
  selector: 'ec-message-display',
  styles: [`
    div.message-display{
        position: absolute;
        text-align: center;
        margin: 10px 15px;
        padding: 5px;
        font-family: Roboto,"Helvetica Neue",sans-serif;
        font-weight: 400;
        font-size: 1.1em;
        border-radius: 5px;
        box-shadow: 10px 10px 5px #888888;
    }

    div.error {
        color: white;
        background-color: #f44336;
        border: 2px solid #892822;
    }
    div.info {
        color: white;
        background-color: #8084ec;
        border: 2px solid #21236f;
    }
  `],
  template: `
    <div *ngIf="messageService.getMessage()"
         class="message-display"
         [class.info]="messageService.isInfo()"
         [class.error]="messageService.isError()">
        {{ messageService.getMessage() }}
    </div>
  `
})
export class MessageDisplayComponent implements OnInit {

  constructor(
    public messageService: MessageService
  ) { }

  ngOnInit() {
  }

}
