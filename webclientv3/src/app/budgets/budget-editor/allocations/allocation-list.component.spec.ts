import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import {Observable} from "rxjs/Observable";
import { TestConfigModule } from "../../../../../test/test-config.module";
import { AllocationData } from "../../../transactions/allocation-data.model";
import { BudgetService } from "../../budget.service";
import { BudgetsModule } from "../../budgets.module";

import { AllocationListComponent } from "./allocation-list.component";

describe("AllocationListComponent", () => {
  let component: AllocationListComponent;
  let fixture: ComponentFixture<AllocationListComponent>;
  let budgetService: BudgetService;
  let sampleCategories = [
    { id: 10, name: "First Category" },
    { id: 20, name: "Second Category" },
    { id: 30, name: "Third Category" },
    { id: 40, name: "Fourth Category" }
  ];
  let sampleAllocations: AllocationData[] = [
    {
      id: 1,
      name: "1",
      allocation_category_id: 10,
      allocation_category: {
        id: 10,
        name: "First Category"
      }
    },
    {
      id: 2,
      name: "2",
      allocation_category_id: 20,
      allocation_category: {
        id: 20,
        name: "Second Category"
      }
    },
    {
      id: 3,
      name: "3",
      allocation_category_id: 20,
      allocation_category: {
        id: 20,
        name: "Second Category"
      }
    },
    {
      id: 4,
      name: "4",
      allocation_category_id: 10,
      allocation_category: {
        id: 10,
        name: "First Category"
      }
    },
    {
      id: 5,
      name: "5",
      allocation_category_id: 30,
      allocation_category: {
        id: 30,
        name: "Third Category"
      }
    }
  ];

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule, BudgetsModule]
        // declarations: [ AllocationListComponent ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationListComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("allocation groupings", () => {
    beforeEach(() => {
      budgetService = TestBed.get(BudgetService);
    });

    it("has the correct length", () => {
      let spy = spyOn(budgetService, "getAllocationCategories").and.returnValue(
        Observable.of(sampleCategories)
      );

      fixture.detectChanges();
      expect(spy.calls.count()).toBe(1);
      component.allocations = sampleAllocations;
      expect(component.allocationCategories.length).toEqual(4);
      expect(component.allocationsByCategory.length).toEqual(4);
      expect(component.allocationsByCategory[0]).toEqual({
        id: 10,
        name: "First Category",
        allocations: [
          {
            id: 1,
            name: "1",
            allocation_category_id: 10,
            allocation_category: {
              id: 10,
              name: "First Category"
            }
          },
          {
            id: 4,
            name: "4",
            allocation_category_id: 10,
            allocation_category: {
              id: 10,
              name: "First Category"
            }
          }
        ]
      });
    });
  });
});