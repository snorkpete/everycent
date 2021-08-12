import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {TestConfigModule} from "../../../../test/test-config.module";
import {SharedModule} from "../../shared/shared.module";

import { BudgetListComponent } from './budget-list.component';

describe('BudgetListComponent', () => {
  let component: BudgetListComponent;
  let fixture: ComponentFixture<BudgetListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
        SharedModule,
      ],
      declarations: [ BudgetListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
