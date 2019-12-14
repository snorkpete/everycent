import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { TestConfigModule } from "../../../../test/test-config.module";
import { TransactionDateValidatorDirective } from "../transaction-date-validator.directive";

import { TransactionListComponent } from "./transaction-list.component";
import { SharedModule } from "../../shared/shared.module";
import { DebugElement } from "@angular/core";
import { By } from "@angular/platform-browser";

describe("TransactionListComponent", () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TransactionListComponent>;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule, SharedModule.forRoot()],
      declarations: [
        TransactionListComponent,
        TransactionDateValidatorDirective
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionListComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("has an edit-actions component", () => {
    let editActionsEl = de.query(By.css("ec-edit-actions"));
    expect(editActionsEl).toBeTruthy();
  });

  it("#switchToDisplayMode changes editMode flag to false", () => {
    component.switchToDisplayMode();
    expect(component.isEditMode).toBe(false);
  });
});
