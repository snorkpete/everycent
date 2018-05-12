/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { EditActionsComponent } from "./edit-actions.component";
import { Subject } from "rxjs";

describe("EditActionsComponent", () => {
  let component: EditActionsComponent;
  let fixture: ComponentFixture<EditActionsComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [EditActionsComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(EditActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe('"Make Changes" button', () => {
    it("exists", () => {
      let makeChangesBtn = fixture.debugElement.query(
        By.css("button.make-changes")
      );
      expect(makeChangesBtn).toBeTruthy("button exists");
      expect(makeChangesBtn.nativeElement.textContent).toContain(
        "Make Changes"
      );
    });

    it("clicking it fires the editModeChange event", () => {
      let subject = new Subject();
      let spy = spyOn(subject, "next");
      component.editModeChange.subscribe(subject);

      let makeChangesBtn = fixture.debugElement.query(
        By.css("button.make-changes")
      );
      makeChangesBtn.nativeElement.click();
      fixture.detectChanges();
      expect(spy.calls.any()).toBeTruthy("calls next on the subject");
    });

    it("is hidden if editMode is true", () => {
      let makeChangesBtn = fixture.debugElement.nativeElement.querySelector(
        "button.make-changes"
      );
      expect(makeChangesBtn).toBeTruthy("button exists");

      component.editMode = true;
      fixture.detectChanges();

      makeChangesBtn = fixture.debugElement.nativeElement.querySelector(
        "button.make-changes"
      );
      expect(makeChangesBtn).toBeFalsy("button does not exist");
    });
  });

  describe('"Save" button', () => {
    it("does not exist by default", () => {
      let saveBtn = fixture.debugElement.nativeElement.querySelector(
        "button.save"
      );
      expect(saveBtn).toBeFalsy("button does not exist");
    });

    it("is visible if editMode is true", () => {
      let saveBtn = fixture.debugElement.nativeElement.querySelector(
        "button.save"
      );
      expect(saveBtn).toBeFalsy("button does not exist");

      component.editMode = true;
      fixture.detectChanges();

      saveBtn = fixture.debugElement.nativeElement.querySelector("button.save");
      expect(saveBtn).toBeTruthy("button exists");
    });

    it("clicking it fires the save event", () => {
      let subject = new Subject();
      let spy = spyOn(subject, "next");
      component.save.subscribe(subject);

      component.editMode = true;
      fixture.detectChanges();

      let saveBtn = fixture.debugElement.query(By.css("button.save"));
      saveBtn.nativeElement.click();
      fixture.detectChanges();
      expect(spy.calls.any()).toBeTruthy("calls next on the subject");
    });
  });

  describe('"Cancel" button', () => {
    it("does not exist by default", () => {
      let cancelBtn = fixture.debugElement.nativeElement.querySelector(
        "button.cancel"
      );
      expect(cancelBtn).toBeFalsy("button does not exist");
    });

    it("is visible if editMode is true", () => {
      let cancelBtn = fixture.debugElement.nativeElement.querySelector(
        "button.cancel"
      );
      expect(cancelBtn).toBeFalsy("button does not exist");

      component.editMode = true;
      fixture.detectChanges();

      cancelBtn = fixture.debugElement.nativeElement.querySelector(
        "button.cancel"
      );
      expect(cancelBtn).toBeTruthy("button exists");
    });

    it("clicking it fires the cancel event", () => {
      let subject = new Subject();
      let spy = spyOn(subject, "next");
      component.cancel.subscribe(subject);

      component.editMode = true;
      fixture.detectChanges();

      let cancelBtn = fixture.debugElement.query(By.css("button.cancel"));
      cancelBtn.nativeElement.click();
      fixture.detectChanges();
      expect(spy.calls.any()).toBeTruthy("calls next on the subject");
    });
  });
});
