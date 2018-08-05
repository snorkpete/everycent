import { Component, Input, OnInit } from "@angular/core";
import { SettingsService } from "../../../shared/settings.service";
import { total } from "../../../util/total";
import { BudgetData } from "../../budget.model";

@Component({
  selector: "ec-allocation-list-summary",
  template: `
    <h1>Summary</h1>
    <table class="table">
      <tbody>
      <ng-container *ngIf="familyType === 'single'; else coupleFields">
        <tr>
          <td class="right highlight"> {{singlePerson}}'s Discretionary Amount</td>
          <td class="right">{{ totalDiscretionaryAmount() | ecMoney }}</td>
        </tr>
      </ng-container>
      <ng-template #coupleFields>
        <tr>
          <td class="right highlight">Total Discretionary Amount</td>
          <td class="right">{{ totalDiscretionaryAmount() | ecMoney }}</td>
        </tr>
        <tr>
          <td class="right highlight"> {{wife}}'s Amount</td>
          <td class="right">{{ totalDiscretionaryAmount() / 2 | ecMoney }}</td>
        </tr>
        <tr>
          <td class="right highlight"> {{husband}}'s Amount</td>
          <td class="right">{{ totalDiscretionaryAmount() / 2 | ecMoney }}</td>
        </tr>
      </ng-template>
      </tbody>
    </table>
  `,
  styles: [
    `
    .highlight {
      font-weight: bold;
      font-size: 14px;
    }
  `
  ]
})
export class AllocationListSummaryComponent implements OnInit {
  @Input() budget: BudgetData = { incomes: [], allocations: [] };

  wife = "Wife";
  husband = "Husband";
  singlePerson = "User";
  familyType = "couple";

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.getSettings().subscribe(settings => {
      this.wife = settings.wife;
      this.husband = settings.husband;
      this.singlePerson = settings.single_person;
      this.familyType = settings.family_type;
    });
  }

  totalDiscretionaryAmount() {
    return (
      total(this.budget.incomes, "amount") -
      total(this.budget.allocations, "amount")
    );
  }
}
