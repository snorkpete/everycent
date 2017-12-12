import {DebugElement} from "@angular/core";
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from "@angular/forms";
import {MatCheckbox} from "@angular/material";
import {By} from "@angular/platform-browser";
import {EcMaterialModule} from "../../ec-material/ec-material.module";

import {PaidFieldComponent} from './paid-field.component';

describe('PaidFieldComponent', () => {
  let component: PaidFieldComponent;
  let fixture: ComponentFixture<PaidFieldComponent>;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        EcMaterialModule, ReactiveFormsModule,
      ],
      declarations: [ PaidFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaidFieldComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when editMode is off', () => {

    beforeEach(() => {
      component.editMode = false;
    });

    it("shows 'Yes' if value is paid", () => {
      component.value = 'paid';
      fixture.detectChanges();
      expect(de.nativeElement.innerHTML).toContain('Yes');
    });

    it("shows 'No' if transaction is unpaid", () => {
      component.value = 'unpaid';
      fixture.detectChanges();
      expect(de.nativeElement.innerHTML).toContain('No');
    });
  });

  describe('when editMode is on', () => {

    beforeEach(() => {
      component.editMode = true;
    });

    it("shows a checked checkbox if status is paid", () => {
      component.value = 'paid';
      fixture.detectChanges();
      let checkbox: MatCheckbox = de.query(By.directive(MatCheckbox)).componentInstance;
      expect(checkbox).toBeTruthy();
      expect(checkbox.checked).toBeTruthy('checkbox is checked');
    });

    it("shows 'No' if transaction is unpaid", () => {
      component.value = 'unpaid';
      fixture.detectChanges();
      let checkbox: MatCheckbox = de.query(By.directive(MatCheckbox)).componentInstance;
      expect(checkbox).toBeTruthy();
      expect(checkbox.checked).toBeFalsy('checkbox is unchecked');
    });

    it('updates the status when checked', () => {
      fixture.detectChanges();
      // apparently the click handler for the material checkbox
      // is on the label inside the checkbox,
      // so let's trigger that checkbox by clicking the label
      let checkbox = de.query(By.css('mat-checkbox label'));

      checkbox.nativeElement.click();
      expect(component.value).toEqual('paid');

      checkbox.nativeElement.click();
      expect(component.value).toEqual('unpaid');
    });
  });
});
