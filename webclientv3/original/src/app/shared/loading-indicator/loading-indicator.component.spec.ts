/* tslint:disable:no-unused-variable */
import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';

import { LoadingIndicatorComponent } from './loading-indicator.component';
import {MaterialModule} from '@angular/material';
import {LoadingIndicator} from './loading-indicator.service';

describe('LoadingIndicatorComponent', () => {
  let component: LoadingIndicatorComponent;
  let fixture: ComponentFixture<LoadingIndicatorComponent>;
  let el: DebugElement;
  let loadingIndicator: LoadingIndicator;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      //imports: [MaterialModule.forRoot()],
      declarations: [ LoadingIndicatorComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        LoadingIndicator,
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingIndicatorComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    fixture.detectChanges();
  });

  beforeEach(inject([LoadingIndicator], (_loadingIndicator) => {
    loadingIndicator = _loadingIndicator;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows and hides based on loading indicator', async(() => {
    loadingIndicator.show();
    fixture.detectChanges();
    let visible = el.query(By.css('.loader'));
    expect(visible).toBeTruthy('indicator should be visible');

    loadingIndicator.hide();
    fixture.detectChanges();
    let invisible = el.query(By.css('.loader'));
    expect(invisible).toBeFalsy('indicator should NOT be visible');
  }));
});
