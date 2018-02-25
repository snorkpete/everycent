import {Component, Input, OnInit} from '@angular/core';
import {SettingsService} from "../../../shared/settings.service";
import {total} from "../../../util/total";
import {BudgetData} from "../../budget.model";

@Component({
  selector: 'ec-allocation-list-summary',
  template: `
    <h1>Summary</h1>
    <table class="table">
      <tbody>
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
      </tbody>
    </table>
  `,
  styles: [`
    .highlight {
      font-weight: bold;
      font-size: 14px;
    }
  `]
})
export class AllocationListSummaryComponent implements OnInit {

  @Input() budget: BudgetData = { incomes: [], allocations: [] };

  wife = 'Wife';
  husband = 'Husband';

  constructor(
    private settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.settingsService.getSettings().subscribe(settings => {
      this.wife = settings.wife;
      this.husband = settings.husband;
    });
  }

  totalDiscretionaryAmount() {
    return total(this.budget.incomes, 'amount') - total(this.budget.allocations, 'amount');
  }

}
