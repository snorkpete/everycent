import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {SharedModule} from "../../../shared/shared.module";

import { IncomeListRowComponent } from './income-list-row.component';

describe('IncomeListRowComponent', () => {
  let component: IncomeListRowComponent;
  let fixture: ComponentFixture<IncomeListRowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
      ],
      declarations: [ IncomeListRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeListRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
