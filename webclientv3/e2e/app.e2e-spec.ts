import { EverycentPage } from './app.po';

describe('everycent App', function() {
  let page: EverycentPage;

  beforeEach(() => {
    page = new EverycentPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('ec works!');
  });
});
