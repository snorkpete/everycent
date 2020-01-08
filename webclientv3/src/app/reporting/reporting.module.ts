import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";

import { ReportingRoutingModule } from "./reporting-routing.module";
import { ReportsComponent } from "./reports/reports.component";
import { NetWorthReportComponent } from "./net-worth-report/net-worth-report.component";
import { CategorySpendingReportComponent } from "./category-spending-report/category-spending-report.component";
import { NeedsVsWantsReportComponent } from "./needs-vs-wants-report/needs-vs-wants-report.component";

@NgModule({
  imports: [SharedModule, ReportingRoutingModule],
  declarations: [
    ReportsComponent,
    NetWorthReportComponent,
    CategorySpendingReportComponent,
    NeedsVsWantsReportComponent
  ]
})
export class ReportingModule {}
