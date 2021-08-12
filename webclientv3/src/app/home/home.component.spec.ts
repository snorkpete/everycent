/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TestConfigModule } from "../../../test/test-config.module";

import { HomeComponent } from "./home.component";
import { MainToolbarService } from "../shared/main-toolbar/main-toolbar.service";

describe("HomeComponent", () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule],
        declarations: [HomeComponent],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [MainToolbarService]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
