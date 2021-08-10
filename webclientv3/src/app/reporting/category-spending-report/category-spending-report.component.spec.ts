import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { TestConfigModule } from "../../../../test/test-config.module";
import { SharedModule } from "../../shared/shared.module";
import { ReportingModule } from "../reporting.module";
import { ReportingService } from "../reporting.service";

import { CategorySpendingReportComponent } from "./category-spending-report.component";

describe("CategorySpendingReportComponent", () => {
  let component: CategorySpendingReportComponent;
  let fixture: ComponentFixture<CategorySpendingReportComponent>;
  let reportingService: ReportingService;
  let spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule, SharedModule.forRoot(), ReportingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    reportingService = TestBed.inject(ReportingService);
    spy = spyOn(reportingService, "getCategorySpending").and.returnValue(
      of({
        data: [],
        fields: []
      })
    );
    fixture = TestBed.createComponent(CategorySpendingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    // expect(spy.calls.mostRecent()).toEqual('boo');
    expect(component).toBeTruthy();
  });
});
