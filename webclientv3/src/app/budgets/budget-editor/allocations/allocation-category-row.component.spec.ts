import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {SharedModule} from "../../../shared/shared.module";

import { AllocationCategoryRowComponent } from './allocation-category-row.component';

describe('AllocationCategoryRowComponent', () => {
  let component: AllocationCategoryRowComponent;
  let fixture: ComponentFixture<AllocationCategoryRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
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
