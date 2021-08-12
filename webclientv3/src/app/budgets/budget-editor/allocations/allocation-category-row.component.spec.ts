import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {TestConfigModule} from "../../../../../test/test-config.module";
import {SharedTransactionsModule} from "../../../shared-transactions/shared-transactions.module";
import {SharedModule} from "../../../shared/shared.module";

import { AllocationCategoryRowComponent } from './allocation-category-row.component';

describe('AllocationCategoryRowComponent', () => {
  let component: AllocationCategoryRowComponent;
  let fixture: ComponentFixture<AllocationCategoryRowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
        SharedModule,
        SharedTransactionsModule,
      ],
      declarations: [ AllocationCategoryRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationCategoryRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
