/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MoneyFieldComponent } from './money-field.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MoneyPipe} from '../../money.pipe';
import {SharedModule} from "../../shared.module";

describe('MoneyFieldComponent', () => {
  let component: MoneyFieldComponent;
  let fixture: ComponentFixture<MoneyFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, ReactiveFormsModule],
      declarations: [ MoneyFieldComponent, MoneyPipe ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoneyFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('In NON-EDIT-MODE', () => {
    it('displays its value as a two-digit value', () => {

      component.editMode = false;
      component.value = 10000;
      let displayEl = fixture.debugElement.query(By.css('span.value'));
      fixture.detectChanges();
      expect(displayEl.nativeElement.textContent).toEqual('100.00');
    });
  });

  describe('In EDIT-MODE', () => {
    let textEl: HTMLInputElement;

    beforeEach(() => {
      component.editMode = true;
      fixture.detectChanges();
      textEl = fixture.debugElement.query(By.css('input.value')).nativeElement;
    });

    it('displays its value at a two-digit value in a text field', () => {
      component.value = 54000;
      fixture.detectChanges();
      expect(textEl.value).toEqual('540.00');
    });

    it('updates the inner value when someone types in the text field', () => {
      textEl.value = '350';
      textEl.dispatchEvent(new Event('input'));
      expect(component.value).toEqual(35000, 'updates the inner value');
      expect(textEl.value).toEqual('350', 'does not change the input field yet');
    });

    it('formats the text field after the user finishes typing', () => {
      textEl.value = '5';
      textEl.dispatchEvent(new Event('input'));
      textEl.dispatchEvent(new Event('blur'));
      expect(component.value).toEqual(500, 'updates the component inner value');
      expect(textEl.value).toEqual('5.00', 'formats the text field value');
    });
  });
});
