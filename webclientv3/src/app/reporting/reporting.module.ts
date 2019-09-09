import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../shared/shared.module";

import { ReportingRoutingModule } from "./reporting-routing.module";
import { ReportsComponent } from "./reports/reports.component";
import { NetWorthReportComponent } from "./net-worth-report/net-worth-report.component";

@NgModule({
  imports: [SharedModule, ReportingRoutingModule],
  declarations: [ReportsComponent, NetWorthReportComponent]
})
export class ReportingModule {}
