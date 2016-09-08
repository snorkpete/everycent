import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

export interface Message {
  text: string,
  type: string
}

export const MessageType = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
};

@Injectable()
export class MessageService {

  public message$ = new BehaviorSubject<Message>({text: '', type: MessageType.INFO});

  setMessage(message) {
    this.message$.next({text: message, type: MessageType.INFO});
    setTimeout(() => this.clearMessage(), 5000);
  }

  setErrorMessage(message) {
    this.message$.next({text: message, type: MessageType.ERROR});
    setTimeout(() => this.clearMessage(), 5000);
  }

  setWarningMessage(message) {
    this.message$.next({text: message, type: MessageType.WARNING});
    setTimeout(() => this.clearMessage(), 5000);
  }

  clearMessage() {
    this.message$.next({text: '', type: MessageType.INFO});
  }

}
