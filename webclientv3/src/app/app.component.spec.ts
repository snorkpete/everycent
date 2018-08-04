/* tslint:disable:no-unused-variable */

import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { AppComponent } from "./app.component";
import { ApiGateway } from "../api/api-gateway.service";
import { ApiGatewayStub } from "../../test/stub-services/api-gateway-stub";
import { NO_ERRORS_SCHEMA } from "@angular/core";

describe("AppComponent", () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [AppComponent],
      providers: [{ provide: ApiGateway, useValue: ApiGatewayStub }],
      // we're not gonna instantiate the nested components of AppComponent,
      // so don't bother to error check the template
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });

  it(
    "should create the app",
    async(() => {
      expect(app).toBeTruthy();
    })
  );

  it(
    "has a nested router outlet",
    async(() => {
      const element = fixture.debugElement.nativeElement;
      expect(element.querySelector("router-outlet")).toBeTruthy();
    })
  );
});
