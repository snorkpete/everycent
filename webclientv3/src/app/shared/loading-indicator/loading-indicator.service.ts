import { Injectable } from '@angular/core';

@Injectable()
export class LoadingIndicator {

  private _isVisible = false;
  constructor() { }

  isVisible(): boolean {
    return this._isVisible;
  }

  show(): void {
    this._isVisible = true;
  }

  hide(): void {
    this._isVisible = false;
  }
}
