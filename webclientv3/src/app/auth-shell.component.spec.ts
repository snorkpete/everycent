import { NO_ERRORS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { AuthShellComponent } from "./auth-shell.component";

describe("AuthShellComponent", () => {
  let component: AuthShellComponent;
  let fixture: ComponentFixture<AuthShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthShellComponent],
      // we're not gonna instantiate the nested components of AuthShellComponent,
      // so don't bother to error check the template
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("has a nested menu component", async(() => {
    const element = fixture.debugElement.nativeElement;
    expect(element.querySelector("ec-menu")).toBeTruthy();
  }));

  it("has a nested loading indicator component", async(() => {
    const element = fixture.debugElement.nativeElement;
    expect(element.querySelector("ec-loading-indicator")).toBeTruthy();
  }));

  it("has a nested main toolbar component", async(() => {
    const element = fixture.debugElement.nativeElement;
    expect(element.querySelector("ec-main-toolbar")).toBeTruthy();
  }));
});
