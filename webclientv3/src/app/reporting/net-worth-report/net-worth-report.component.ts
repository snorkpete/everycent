import { Component, OnDestroy, OnInit } from "@angular/core";
import { ReportingService } from "../reporting.service";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

@Component({
  selector: "ec-net-worth-report",
  template: `
    <mat-card class="main">
      <mat-card-content>
        <h1>Net Worth Report</h1>

        <div class="data-display">
          <table
            mat-table
            [dataSource]="data"
            [trackBy]="trackByPeriod"
            class="mat-elevation-z8"
          >
            <!-- Period Column -->
            <ng-container matColumnDef="period">
              <th mat-header-cell *matHeaderCellDef class="right">Period</th>
              <td mat-cell *matCellDef="let dataRow" class="right">
                {{ dataRow.period }}
              </td>
            </ng-container>

            <!-- Net Change Column -->
            <ng-container matColumnDef="net_change">
              <th mat-header-cell *matHeaderCellDef class="right">
                Net Change
              </th>
              <td mat-cell *matCellDef="let dataRow" class="right">
                {{ dataRow.net_change | ecMoney }}
              </td>
            </ng-container>

            <!-- Net Worth Column -->
            <ng-container matColumnDef="net_worth">
              <th mat-header-cell *matHeaderCellDef class="right">Net Worth</th>
              <td mat-cell *matCellDef="let dataRow" class="right">
                {{ dataRow.net_worth | ecMoney }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="fields; sticky: true"></tr>
            <tr mat-row *matRowDef="let dataRow; columns: fields"></tr>
          </table>

          <div id="chartdiv"></div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      table {
        table-layout: fixed;
      }
      table td:first-of-type,
      table th:first-of-type {
        padding-left: 24px;
      }

      #chartdiv {
        background: white;
        padding: 16px;
        max-height: 500px;
        position: sticky;
        top: 5px;
      }

      .data-display {
        display: flex;
      }

      .data-display > * {
        flex: 1;
        margin: 20px;
      }
    `
  ]
})
export class NetWorthReportComponent implements OnInit, OnDestroy {
  data: any[] = [];
  fields: string[] = [];
  chart: am4charts.XYChart;

  constructor(private reportingService: ReportingService) {}

  ngOnInit() {
    this.reportingService.getNetWorth().subscribe((data: any) => {
      this.data = data.data;
      this.fields = data.fields;

      this.createChart();
    });
  }

  trackByPeriod(index: number, row: any) {
    return row.period;
  }

  private createChart() {
    this.chart = am4core.create("chartdiv", am4charts.XYChart);
    this.chart.numberFormatter.numberFormat = "#.00";

    let periodAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
    periodAxis.dataFields.category = "period";
    periodAxis.title.text = "Period";

    let valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Euros(€)";

    let series = this.chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = "net_worth";
    series.dataFields.categoryX = "period";
    series.name = "Net Worth";
    // series..template.tooltipText = "Series: {name}\nCategory: {categoryX}\nValue: {valueY}";

    let bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.tooltipText = "{name}\n{valueY} at {categoryX}";

    // Add data
    this.chart.data = this.data.map(row => ({
      period: row.period,
      net_worth: row.net_worth / 100.0
    }));

    // And, for a good measure, let's add a legend
    this.chart.legend = new am4charts.Legend();
  }

  ngOnDestroy(): void {
    this.chart.dispose();
  }
}
