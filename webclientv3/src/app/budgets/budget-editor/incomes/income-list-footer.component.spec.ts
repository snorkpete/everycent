import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {SharedModule} from "../../../shared/shared.module";

import { IncomeListFooterComponent } from './income-list-footer.component';

describe('IncomeListFooterComponent', () => {
  let component: IncomeListFooterComponent;
  let fixture: ComponentFixture<IncomeListFooterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
      ],
      declarations: [ IncomeListFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeListFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
