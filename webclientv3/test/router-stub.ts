import {BehaviorSubject} from 'rxjs/BehaviorSubject';

let RouterStub = {
  navigatedTo: '',
  navigateByUrl: function(url: string) {
    this.navigatedTo = url;
  },
  events: new BehaviorSubject<any>({}),
};

RouterStub.navigatedTo = null;

export {RouterStub};

