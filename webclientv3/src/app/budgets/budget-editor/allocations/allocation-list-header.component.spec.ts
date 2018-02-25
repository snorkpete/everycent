import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationListHeaderComponent } from './allocation-list-header.component';

describe('AllocationListHeaderComponent', () => {
  let component: AllocationListHeaderComponent;
  let fixture: ComponentFixture<AllocationListHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllocationListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
