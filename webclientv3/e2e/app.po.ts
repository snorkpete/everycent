import { browser, element, by } from 'protractor';

export class EverycentPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('ec-root h1')).getText();
  }
}
