import {Component, Input, OnInit} from '@angular/core';
import {AllocationData} from "../../allocation.model";

@Component({ /* tslint:disable component-selector */
  selector: '[ec-allocation-category-row]',
  template: `
    <td>
      <ec-text-field [(ngModel)]="allocation.name" [editMode]="editMode"></ec-text-field>
    </td>
    <td class="right">
      <ec-money-field [(ngModel)]="allocation.amount" [editMode]="editMode"></ec-money-field>
    </td>
    <td class="right">
      <ec-money-field [value]="allocation.spent"></ec-money-field>
    </td>
    <td class="right">
      <ec-money-field [value]="allocation.amount - allocation.spent"></ec-money-field>
    </td>
    <td>
      <ec-text-field [(ngModel)]="allocation.comment" [editMode]="editMode"></ec-text-field>
    </td>
    <td>
      <ec-delete-button [item]="allocation" [editMode]="editMode"></ec-delete-button>
    </td>
  `,
  styles: []
})
export class AllocationCategoryRowComponent implements OnInit {

  @Input() allocation: AllocationData = {};
  @Input() editMode = false;

  constructor() { }

  ngOnInit() {
  }

}
