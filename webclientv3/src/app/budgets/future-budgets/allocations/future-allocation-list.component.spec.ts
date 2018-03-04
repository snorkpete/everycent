import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FutureAllocationListComponent } from './future-allocation-list.component';

describe('FutureAllocationListComponent', () => {
  let component: FutureAllocationListComponent;
  let fixture: ComponentFixture<FutureAllocationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FutureAllocationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureAllocationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
