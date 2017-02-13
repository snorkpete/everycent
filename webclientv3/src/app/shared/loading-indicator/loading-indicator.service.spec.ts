/* tslint:disable:no-unused-variable */

import { LoadingIndicator } from './loading-indicator.service';

describe('LoadingIndicatorService', () => {
  let loadingIndicator = new LoadingIndicator();

  it('has a boolean isVisible property', () => {
    expect(loadingIndicator.isVisible).toBeDefined('has an isVisible method');
  });

  it('is not visible by default', () => {
    expect(loadingIndicator.isVisible()).toEqual(false);
  });

  it('"show" and "hide" changes the visibility accordingly', () => {
    loadingIndicator.show();
    expect(loadingIndicator.isVisible()).toEqual(true);

    loadingIndicator.hide();
    expect(loadingIndicator.isVisible()).toEqual(false);
  });

});
