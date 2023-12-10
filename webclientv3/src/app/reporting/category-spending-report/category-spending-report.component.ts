import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";
import { DataSource } from "@angular/cdk/collections";
import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { uniq } from "lodash-es";
import { MainToolbarService } from "../../shared/main-toolbar/main-toolbar.service";
import { ReportFieldConfig } from "../ReportFieldConfig";
import { ReportingService } from "../reporting.service";

@Component({
  selector: "ec-category-spending-report",
  template: `
    <mat-card class="main">
      <mat-card-content>
        <h1>Spending By Category Report</h1>

        <mat-form-field>
          <mat-select
            placeholder="Category"
            [formControl]="selectedCategoryForm"
          >
            <mat-option
              *ngFor="let category of getCategories()"
              [value]="category"
              >{{ category }}</mat-option
            >
          </mat-select>
        </mat-form-field>

        <div class="data-display">
          <table
            mat-table
            [dataSource]="filteredData"
            [trackBy]="trackByPeriod"
            class="mat-elevation-z8"
          >
            <ng-container *ngFor="let field of fields">
              <!-- Net Worth Column -->
              <ng-container [matColumnDef]="field.name">
                <th mat-header-cell *matHeaderCellDef class="right">
                  {{ field.label }}
                </th>
                <td mat-cell *matCellDef="let dataRow" class="right">
                  <!--                  {{ dataRow[field.name] }}-->
                  <span *ngIf="field.numeric">
                    {{ dataRow[field.name] | ecMoney }}
                  </span>
                  <span *ngIf="!field.numeric">
                    {{ dataRow[field.name] }}
                  </span>
                </td>
              </ng-container>
            </ng-container>
            <tr
              mat-header-row
              *matHeaderRowDef="fieldNames(); sticky: true"
            ></tr>
            <tr mat-row *matRowDef="let dataRow; columns: fieldNames()"></tr>
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
      /* On screens that are 600px or less */
      @media screen and (max-width: 600px) {
        .data-display {
          flex-direction: column;
        }

        #chartdiv {
          height: 400px;
        }
      }
    `
  ]
})
export class CategorySpendingReportComponent implements OnInit {
  data: any[] = [];
  filteredData: any[] = [];
  fields: ReportFieldConfig[] = [];
  chart: am4charts.XYChart;
  dataSource: DataSource<any>;

  selectedCategory = "";
  selectedCategoryForm = new UntypedFormControl("");
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  constructor(
    private toolbarService: MainToolbarService,
    private reportingService: ReportingService
  ) {}

  fieldNames() {
    return this.fields.map(field => field.name);
  }

  trackByPeriod(index: number, row: any) {
    return row.period;
  }

  getCategories(): String[] {
    return uniq(this.data.map(data => data.category_name));
  }

  ngOnInit() {
    this.toolbarService.setHeading("Category Spending Report");
    this.dataSource = new MatTableDataSource([{}]);
    this.reportingService.getCategorySpending().subscribe((data: any) => {
      this.data = data.data;
      this.fields = data.fields;
      this.createChart();
    });

    this.selectedCategoryForm.valueChanges.pipe().subscribe(newValue => {
      this.filteredData = this.data.filter(
        row => row.category_name === newValue
      );
      this.chart.data = this.filteredData.map(row => ({
        period: row.period,
        budgeted: row.budgeted / 100.0,
        spent: row.spent / 100.0
      }));
      this.table.renderRows();
    });
  }

  private createChart() {
    this.chart = am4core.create("chartdiv", am4charts.XYChart);
    this.chart.numberFormatter.numberFormat = "#.00";

    let periodAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
    periodAxis.dataFields.category = "period";
    periodAxis.title.text = "Period";

    let valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Euros(€)";

    let series = this.chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "budgeted";
    series.dataFields.categoryX = "period";
    series.name = "Budgeted";
    series.columns.template.tooltipText = "{name}\n{valueY} for {categoryX}";
    // "Series: {name}\nCategory: {categoryX}\nValue: {valueY}";

    // let bullet = series.bullets.push(new am4charts.CircleBullet());
    // bullet.tooltipText = "{name}\n{valueY} at {categoryX}";

    series = this.chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "spent";
    series.dataFields.categoryX = "period";
    series.name = "Actual";
    series.columns.template.tooltipText = "{name}\n{valueY} for {categoryX}";
    // "Series: {name}\nCategory: {categoryX}\nValue: {valueY}";
    // series..template.tooltipText = "Series: {name}\nCategory: {categoryX}\nValue: {valueY}";

    // bullet = series.bullets.push(new am4charts.CircleBullet());
    // bullet.tooltipText = "{name}\n{valueY} at {categoryX}";

    // Add data
    this.chart.data = this.filteredData.map(row => ({
      period: row.period,
      budgeted: row.budgeted / 100.0,
      spent: row.spent / 100.0
    }));

    // And, for a good measure, let's add a legend
    this.chart.legend = new am4charts.Legend();
  }
}
