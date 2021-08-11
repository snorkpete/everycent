/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { EcMaterialModule } from "../../ec-material/ec-material.module";

import { DateFieldComponent } from "./date-field.component";

describe("DateFieldComponent", () => {
  let component: DateFieldComponent;
  let fixture: ComponentFixture<DateFieldComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [EcMaterialModule, ReactiveFormsModule],
        declarations: [DateFieldComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DateFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("In NON-EDIT-MODE", () => {
    it("displays its value as a formatted date", () => {
      component.editMode = false;
      component.value = new Date("2020-10-01");
      let displayEl = fixture.debugElement.query(By.css("span.value"));
      fixture.detectChanges();
      expect(displayEl.nativeElement.textContent.trim()).toEqual("Oct 1, 2020");
    });
  });
});
