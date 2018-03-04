/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, fakeAsync, inject, TestBed} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import {TestConfigModule} from "../../../../test/test-config.module";
import {SharedModule} from "../shared.module";

import { MessageDisplayComponent } from './message-display.component';
import {MessageService} from '../../message-display/message.service';

describe('MessageDisplayComponent', () => {
  let component: MessageDisplayComponent;
  let fixture: ComponentFixture<MessageDisplayComponent>;
  let el: DebugElement;
  let messageService: MessageService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule, SharedModule.forRoot(),
      ],
      // declarations: [ MessageDisplayComponent ],
      // providers: [MessageService],
      schemas: [NO_ERRORS_SCHEMA],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageDisplayComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    fixture.detectChanges();
  });

  beforeEach(inject([MessageService], (_messageService) => {
    messageService = _messageService;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays the content of MessageService#getMessage', () => {
    messageService.setMessage('hello');
    fixture.detectChanges();
    expect(el.nativeElement.textContent).toContain('hello', 'message displayed from messageService');

    const messageDisplay = el.query(By.css('.message-display'));
    expect(messageDisplay).toBeTruthy('display area should be visible');
  });

  it('hides the messageDisplay area for blank messages', () => {
    messageService.clear();
    fixture.detectChanges();
    const messageDisplay = el.query(By.css('.message-display'));
    expect(messageDisplay).toBeNull('display area should not be visible');
  });

  it('sets the message type class properly', () => {

    messageService.setErrorMessage('error');
    fixture.detectChanges();

    let errorDisplay = el.query(By.css('.error'));
    let infoDisplay = el.query(By.css('.info'));
    expect(errorDisplay).toBeTruthy('finds the error display');
    expect(infoDisplay).toBeFalsy('does not find the info display');

    messageService.setMessage('info');
    fixture.detectChanges();

    errorDisplay = el.query(By.css('.error'));
    infoDisplay = el.query(By.css('.info'));
    expect(infoDisplay).toBeTruthy('finds the info display');
    expect(errorDisplay).toBeFalsy('does not find the error display');
  });

});
