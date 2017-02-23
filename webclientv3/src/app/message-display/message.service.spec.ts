/* tslint:disable:no-unused-variable */

import {MessageService, MessageType} from './message.service';

describe('MessageService', () => {
  let messageService = new MessageService();
  beforeEach(() => {
    messageService = new MessageService();
  });

  it('has a getMessage() method', () => {
    expect(messageService.getMessage).toBeDefined('getMessage() exists');
  });

  it('can set the message', () => {
    messageService.setMessage('hello');
    expect(messageService.getMessage()).toEqual('hello');
    expect(messageService.getMessageType()).toEqual(MessageType.INFO, 'message type is INFO');
  });

  it('can set an error message', () => {
    messageService.setErrorMessage('bad');
    expect(messageService.getMessage()).toEqual('bad');
    expect(messageService.getMessageType()).toEqual(MessageType.ERROR, 'message type is ERROR');
  });

  it('can clear any existing messages', () => {
    messageService.setMessage('random');
    messageService.clear();
    expect(messageService.getMessage()).toEqual('');
  });

  describe('#isError and #isInfo', () => {
    it('returns false if no message exists', () => {
      messageService.clear();
      expect(messageService.isError()).toBeFalsy('should NOT be an error');
      expect(messageService.isInfo()).toBeFalsy('should NOT be an info message either');
    });

    it('is an error but not an info message if error message is set', () => {
      messageService.setErrorMessage('error');
      expect(messageService.isError()).toBeTruthy('should be an error');
      expect(messageService.isInfo()).toBeFalsy('should be an info message');
    });

    it('is an info message but not an error if message is set', () => {
      messageService.setMessage('info messge');
      expect(messageService.isInfo()).toBeTruthy('should be an info message');
      expect(messageService.isError()).toBeFalsy('should not be an error');
    });
  });
});
