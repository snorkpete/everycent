import { Injectable } from '@angular/core';
import {MatSnackBar} from "@angular/material";

export enum MessageType {
  NONE,
  INFO,
  SUCCESS,
  ERROR,
}

@Injectable()
export class MessageService {

  private _messageText = '';
  private _messageType = MessageType.NONE;

  constructor(
    private snackbar: MatSnackBar
  ) { }

  getMessage(): string {
    return this._messageText;
  }

  getMessageType(): MessageType {
    return this._messageType;
  }

  setMessage(newMessage: string, timeout?: number): void {
    this._messageText = newMessage;
    this._messageType = MessageType.INFO;

    if (!timeout) {
      timeout = 3000;
    }
    setTimeout(() => {
      this.clear();
    }, timeout);

    this.snackbar.open(newMessage, null, {duration: 3000});
  }

  setErrorMessage(newMessage: string): void {
    this._messageText = newMessage;
    this._messageType = MessageType.ERROR;
    this.snackbar.open(newMessage, null, {duration: 3000});
  }

  clear(): void {
    this._messageText = '';
    this._messageType = MessageType.NONE;
  }

  isError(): boolean {
    return this.getMessageType() === MessageType.ERROR;
  }

  isInfo(): boolean {
    return this.getMessageType() === MessageType.INFO;
  }

}
