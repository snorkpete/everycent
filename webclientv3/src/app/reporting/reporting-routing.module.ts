import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../core/auth/auth-guard.service";
import { CategorySpendingReportComponent } from "./category-spending-report/category-spending-report.component";
import { NetWorthReportComponent } from "./net-worth-report/net-worth-report.component";
import { ReportsComponent } from "./reports/reports.component";

const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuard],
    children: [
      { path: "", component: ReportsComponent },
      { path: "net-worth", component: NetWorthReportComponent },
      { path: "category-spending", component: CategorySpendingReportComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingRoutingModule {}
