import { Injectable } from '@angular/core';

@Injectable()
export class DeactivateService {

  constructor() { }

  isItemVisible(item: any, showDeactivated: boolean) {
    if (showDeactivated) {
      return true;
    }

    return item.unsaved || item.status === 'open';
  }
}
