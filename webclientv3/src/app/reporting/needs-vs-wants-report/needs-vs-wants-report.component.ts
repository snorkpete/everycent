import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";

import { DataSource } from "@angular/cdk/collections";
import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { MainToolbarService } from "../../shared/main-toolbar/main-toolbar.service";
import { ReportFieldConfig } from "../ReportFieldConfig";
import { ReportingService } from "../reporting.service";

@Component({
  selector: "ec-wants-vs-needs-report",
  template: `
    <mat-card class="main">
      <mat-card-content>
        <h1>Wants vs Needs Report</h1>

        <mat-form-field>
          <mat-select
            placeholder="Budgeted or Actual"
            [formControl]="budgetedVsActualForm"
          >
            <mat-option *ngFor="let class of getClasses()" [value]="class">{{
              class | titlecase
            }}</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="data-display">
          <table
            mat-table
            [dataSource]="data"
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
              *matHeaderRowDef="fieldNamesToDisplay(); sticky: true"
            ></tr>
            <tr
              mat-row
              *matRowDef="let dataRow; columns: fieldNamesToDisplay()"
            ></tr>
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
export class NeedsVsWantsReportComponent implements OnInit {
  data: any[] = [];
  fields: ReportFieldConfig[] = [];
  chart: am4charts.XYChart;
  budgetNeeds: am4charts.Series;
  budgetWants: am4charts.Series;
  budgetSavings: am4charts.Series;
  actualNeeds: am4charts.Series;
  actualWants: am4charts.Series;
  actualSavings: am4charts.Series;
  dataSource: DataSource<any>;

  budgetedVsActualForm = new UntypedFormControl("");
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  constructor(
    private toolbarService: MainToolbarService,
    private reportingService: ReportingService
  ) {}

  trackByPeriod(index: number, row: any) {
    return row.period;
  }

  getClasses(): String[] {
    return ["budgeted", "actual"];
  }

  getFieldsToDisplay(): ReportFieldConfig[] {
    return this.fields.filter(
      field =>
        field.class === "all" || field.class === this.budgetedVsActualForm.value
    );
  }

  fieldNamesToDisplay() {
    return this.getFieldsToDisplay().map(field => field.name);
  }

  ngOnInit() {
    this.toolbarService.setHeading("Needs vs Wants Report");
    this.dataSource = new MatTableDataSource([{}]);
    this.reportingService.getNeedsVsWants().subscribe((data: any) => {
      this.data = data.data;
      this.fields = data.fields;
      this.createChart();
      this.budgetedVsActualForm.setValue("budgeted");
    });

    this.budgetedVsActualForm.valueChanges.pipe().subscribe(newValue => {
      if (newValue === "budgeted") {
        this.budgetNeeds.show();
        this.budgetWants.show();
        this.budgetSavings.show();
        this.actualNeeds.hide();
        this.actualWants.hide();
        this.actualSavings.hide();
      } else {
        this.budgetNeeds.hide();
        this.budgetWants.hide();
        this.budgetSavings.hide();
        this.actualNeeds.show();
        this.actualWants.show();
        this.actualSavings.show();
      }
      this.table.renderRows();
    });
  }

  private createChart() {
    this.chart = am4core.create("chartdiv", am4charts.XYChart);
    this.chart.numberFormatter.numberFormat = "#0";

    let periodAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
    periodAxis.dataFields.category = "period";
    periodAxis.title.text = "Period";
    periodAxis.renderer.grid.template.location = 0;

    let valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "%";
    valueAxis.min = 0;
    valueAxis.max = 100;
    valueAxis.strictMinMax = true;
    valueAxis.renderer.minWidth = 100;
    valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      return text + "%";
    });

    let series = this.chart.series.push(new am4charts.ColumnSeries());
    this.configureSeries(
      series,
      "budgeted_needs_pct",
      "Budgeted Needs",
      "#e28e8e"
    );
    this.budgetNeeds = series;

    series = this.chart.series.push(new am4charts.ColumnSeries());
    this.configureSeries(
      series,
      "budgeted_wants_pct",
      "Budgeted Wants",
      "#353ee2"
    );
    this.budgetWants = series;

    series = this.chart.series.push(new am4charts.ColumnSeries());
    this.configureSeries(
      series,
      "budgeted_savings_pct",
      "Budgeted Savings",
      "#A3E29E"
    );
    this.budgetSavings = series;

    // actual
    // ------

    series = this.chart.series.push(new am4charts.ColumnSeries());
    this.configureSeries(series, "actual_needs_pct", "Needs", "red");
    this.actualNeeds = series;

    series = this.chart.series.push(new am4charts.ColumnSeries());
    this.configureSeries(series, "actual_wants_pct", "Wants", "blue");
    this.actualWants = series;
    series = this.chart.series.push(new am4charts.ColumnSeries());
    this.configureSeries(series, "actual_savings_pct", "Savings", "green");
    this.actualSavings = series;

    // Add data
    this.chart.data = this.data;

    // // And, for a good measure, let's add a legend
    this.chart.legend = new am4charts.Legend();
    this.chart.scrollbarX = new am4core.Scrollbar();
  }

  private configureSeries(
    series: am4charts.ColumnSeries,
    dataField: string,
    label: string,
    color: string
  ) {
    series.dataFields.valueY = dataField;
    series.dataFields.categoryX = "period";
    series.name = label;
    series.columns.template.tooltipText = "{name}\n{valueY}% for {categoryX}";

    // series.columns.template.width = am4core.percent(80);
    series.columns.template.width = am4core.percent(90);
    series.columns.template.fill = am4core.color(color); // fill
    series.dataItems.template.locations.categoryX = 0.5;
    series.stacked = true;
    series.tooltip.pointerOrientation = "vertical";
  }
}
