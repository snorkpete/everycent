import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationListSummaryComponent } from './allocation-list-summary.component';

describe('AllocationListSummaryComponent', () => {
  let component: AllocationListSummaryComponent;
  let fixture: ComponentFixture<AllocationListSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllocationListSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationListSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
