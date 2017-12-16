import {NavigationExtras} from "@angular/router";
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

let RouterStub = {
  navigatedTo: '',
  navigateByUrl: function(url: string) {
    this.navigatedTo = url;
  },
  events: new BehaviorSubject<any>({}),
  navigate(commands: string[], extras: NavigationExtras) {
    return Promise.resolve(commands);
  }
};

RouterStub.navigatedTo = null;

export {RouterStub};

