import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CompactTransactionListComponent } from './compact-transaction-list.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TestConfigModule} from "../../../../test/test-config.module";

describe('CompactTransactionListComponent', () => {
  let component: CompactTransactionListComponent;
  let fixture: ComponentFixture<CompactTransactionListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule],
      declarations: [ CompactTransactionListComponent ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompactTransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
