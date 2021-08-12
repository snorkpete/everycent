import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { of } from "rxjs";
import { TestConfigModule } from "../../../../../test/test-config.module";
import { SharedModule } from "../../../shared/shared.module";
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
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule, SharedModule.forRoot(), BudgetsModule]
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

});
