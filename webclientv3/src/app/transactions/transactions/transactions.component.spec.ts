import {NO_ERRORS_SCHEMA} from "@angular/core";
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TestConfigModule} from "../../../../test/test-config.module";
import {MainToolbarService} from "../../shared/main-toolbar/main-toolbar.service";
import {SharedModule} from "../../shared/shared.module";

import {TransactionsComponent} from './transactions.component';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule.forRoot(),
        TestConfigModule,
      ],
      declarations: [
        TransactionsComponent,
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
