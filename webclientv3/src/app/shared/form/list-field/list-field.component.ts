import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import * as _ from 'lodash';

@Component({
  selector: 'ec-list-field',
  styles: [`
    select {
      width: 100%;
    }
  `],
  template: `
    <!--<select [(ngModel)]="transaction.allocation_id">-->
      <!--<option [value]=""></option>-->
      <!--<option *ngFor="let allocation of allocations" [value]="allocation.id">{{allocation.name}}</option>-->
    <!--</select>-->
    <select *ngIf="editMode; else textDisplay" [formControl]="control">
      <option [value]="0"></option>

      <!-- options go here -->
      <ng-container *ngIf="groupBy; then groupedOptions else normalOptions "></ng-container>

      <!-- grouped options -->
      <ng-template #groupedOptions>
        <optgroup [label]="group.name" *ngFor="let group of groups; trackBy: trackById">
          <option *ngFor="let item of group.items; trackById" [value]="item.id">
            {{item.name}}
          </option>
        </optgroup>
      </ng-template>

      <!-- ungrouped options -->
      <ng-template #normalOptions>
        <option *ngFor="let item of items; trackBy: trackById" [value]="item.id">
          {{item.name}}
        </option>
      </ng-template>

    </select>

    <ng-template #textDisplay >
      <span>{{displayValue}}</span>
    </ng-template>
  `,
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => ListFieldComponent)},
  ]
})
export class ListFieldComponent implements OnInit, ControlValueAccessor {
  private _items: any[] = [];
  @Input() get items(): any[] {
    return this._items;
  }

  set items(newItems: any[]) {
    this._items = newItems;
    this.updateGroupings();
  }

  @Input() get groupBy(): string {
    return this._groupBy;
  }
  set groupBy(newGroupBy: string) {
    this._groupBy = newGroupBy;
    this.updateGroupings();
  }

  private _groupBy: string;

  @Input() editMode = false;
  private _selectedItem: any = {};

  groups: any[];

  private _value: number;
  @Input()
  get value(): number {
    return this._value;
  }
  set value(newValue: number) {
    this._value = newValue;
    this._selectedItem = this.items.find(item => item.id === this._value) || {name: this._value};
  }

  get displayValue(): string {
    return this._selectedItem.name;
  }

  control = new FormControl(0);

  private onChange: Function = (_: any) => {};
  private onTouch: Function = (_: any) => {};

  constructor() { }

  ngOnInit() {
    this.control.valueChanges.subscribe((v: string) => {
      this.onChange(v);
    });
  }

  private updateGroupings() {

    if (!this.groupBy || !this.items) { /*? this.groupBy === 'hello' */
      this.groups = [];
      return;
    }
    // [
    //   {
    //     id: 1,
    //     name: 'Group 10',
    //     items: [
    //       { id: 1, name: 'First'}
    //     ]
    //
    // }
    //
    // ]
    // // { id: 1, name: 'First', group_id: 1, group: {id: 1, name: 'Group 10'} },
    // { id: 2, name: 'Second', group_id: 1, group: {id: 1, name: 'Group 10'} },
    //
    // { id: 3, name: 'Twenty First', group_id: 20, group: {id: 20, name: 'Group Twenty'} },
    // { id: 4, name: 'Twenty Second', group_id: 20, group: {id: 20, name: 'Group Twenty'} },
    // { id: 5, name: 'Twenty Third', group_id: 20, group: {id: 20, name: 'Group Twenty'} },

    // <optgroup label="group.name" *ngFor="let group of groups; trackBy: trackById">
    // <option *ngFor="let item of group.items; trackById" [value]="item.id">
    //   {{item.name}}
    // </option>

    let groupByIdFieldName = `${this.groupBy}_id`;
    let groupByFieldName = this.groupBy || 'none'; /*? groupByIdFieldName */
    let itemsByGroupId = _.groupBy(this.items, groupByIdFieldName); /*? itemsByGroupId */
    this.groups = Object.keys(itemsByGroupId).map(groupId => {
      let group: any = { id: groupId };
      let items = itemsByGroupId[groupId];
      group.name = items[0][groupByFieldName].name;
      group.items = items;
      return group;
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  writeValue(newValue: number): void {
    this.value = newValue;
    this.control.setValue(this.value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

}
