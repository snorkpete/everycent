/* tslint:disable:no-unused-variable */
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import {
  Component,
  ElementRef,
  NO_ERRORS_SCHEMA,
  OnInit,
  ViewChild
} from "@angular/core";

import { TextFieldComponent } from "./text-field.component";
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../../shared.module";
import { EcMaterialModule } from "../../ec-material/ec-material.module";

@Component({
  selector: "ec-form-tester",
  template: `
    <div [formGroup]="form">
      <ec-text-field #first [editMode]="true"></ec-text-field>
      <input #last type="text" formControlName="last" />
    </div>
  `
})
class FormTesterComponent implements OnInit {
  form: UntypedFormGroup;

  @ViewChild(TextFieldComponent, /* TODO: add static flag */ {})
  first: TextFieldComponent;

  @ViewChild("last", /* TODO: add static flag */ {})
  last: ElementRef;

  constructor(private fb: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      first: "first",
      last: "last"
    });
  }
}

describe("TextFieldComponent", () => {
  let component: TextFieldComponent;
  let fixture: ComponentFixture<TextFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EcMaterialModule, ReactiveFormsModule],
      declarations: [TextFieldComponent, FormTesterComponent]
      //schemas: [NO_ERRORS_SCHEMA],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("NON-EDIT-MODE", () => {
    beforeEach(() => {
      component.editMode = false;
      component.value = "Hello";
      fixture.detectChanges();
    });

    it("displays its value as plain text", () => {
      let textEl = fixture.debugElement.query(By.css("span.value"));
      expect(textEl.nativeElement.textContent).toEqual("Hello");
    });

    it("does NOT display the editable text field", () => {
      // must use the native element to test for null values
      // the debugElement version hangs up when testing null values
      let el = fixture.nativeElement.querySelector("input.value");
      expect(el).toBeNull("text field view doesn't exist");
    });
  });

  describe("EDIT-MODE", () => {
    it("displays a text field containing the value", waitForAsync(() => {
      component.editMode = true;
      component.value = "Hello";
      //fixture.detectChanges();

      //let inputEl = fixture.debugElement.query(By.css('input.value'));
      //expect(inputEl.nativeElement.value).toEqual('Hello', 'sets the input field properly');

      //      let el = fixture.nativeElement.querySelector('span.value');
      //      expect(el).toBeNull('span not visible');
    }));
  });

  describe("Form Handling", () => {
    let testHarnessFixture: ComponentFixture<FormTesterComponent>;
    let testHarnessComponent: FormTesterComponent;

    beforeEach(() => {
      //testHarnessFixture = TestBed.createComponent(FormTesterComponent);
      //testHarnessComponent = testHarnessFixture.componentInstance;
      //testHarnessFixture.detectChanges();
    });

    it("sanity check that test harness is configured properly", () => {
      //let lastEl = testHarnessComponent.last.nativeElement;
      //lastEl.value = 'my value';
      //lastEl.dispatchEvent(new Event('input'));
      //expect(testHarnessComponent.form.value).toEqual({first: 'first', last: 'my value'});
    });

    it("check that the form send values to the text field", fakeAsync(() => {
      //testHarnessFixture.detectChanges();
      //tick();
      //testHarnessComponent.form.setValue({ first: 'Hello', last: 'World' });
      //expect(testHarnessComponent.form.controls['first'].value).toEqual('Hello');
      //expect(testHarnessComponent.last.nativeElement.value).toEqual('World');
      //expect(testHarnessComponent.first.value).toEqual('World');
      //expect(testHarnessComponent.form.value).toEqual({ first: "Hello", last: "World"});
      //expect(testHarnessComponent.first.value).toEqual('Hello');
      //testHarnessFixture.detectChanges();
      // seems like detectChanges() isn't needed - dispatch event properly updates the form without it
      // testFixture.detechChanges();
      //expect(testHarnessComponent.form.value).toEqual({first: 'a new value', last: 'my value'});
    }));
  });
});
