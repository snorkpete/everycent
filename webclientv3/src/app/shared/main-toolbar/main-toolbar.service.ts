import {Injectable} from '@angular/core';

@Injectable()
export class MainToolbarService {
  private _showToolbar = true;

  isToolbarVisible(): boolean {
    return this._showToolbar;
  }

  hideToolbar(): void {
    this._showToolbar = false;
  }

  showToolbar(): void {
    this._showToolbar = true;
  }

}
