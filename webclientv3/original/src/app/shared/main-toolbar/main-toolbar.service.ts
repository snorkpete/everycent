import {Injectable} from '@angular/core';

@Injectable()
export class MainToolbarService {
  private _showToolbar = true;
  private _heading: string;

  isToolbarVisible(): boolean {
    return this._showToolbar;
  }

  hideToolbar(): void {
    this._showToolbar = false;
  }

  showToolbar(): void {
    this._showToolbar = true;
  }

  setHeading(newHeading: string): void {
    this._heading = newHeading;
  }

  getHeading(): string {
    return this._heading;
  }

}
