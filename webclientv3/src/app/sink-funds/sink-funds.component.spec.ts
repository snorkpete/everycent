/* tslint:disable:no-unused-variable */
import { ComponentFixture, fakeAsync, inject, TestBed, tick, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { of } from "rxjs";

import { SinkFundsComponent } from "./sink-funds.component";
import { SinkFundService } from "./sink-fund.service";
import { ApiGateway } from "../../api/api-gateway.service";
import { ApiGatewayStub } from "../../../test/stub-services/api-gateway-stub";
import { SampleSinkFundData } from "../../../test/samples/sample-sink-fund-data";

import { TransactionService } from "../transactions/transaction.service";
import { TestConfigModule } from "../../../test/test-config.module";
import { MainToolbarService } from "../shared/main-toolbar/main-toolbar.service";

describe("SinkFundsComponent", () => {
  let component: SinkFundsComponent;
  let fixture: ComponentFixture<SinkFundsComponent>;

  let sinkFundService: SinkFundService;
  let apiGateway: ApiGateway;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule],
        declarations: [SinkFundsComponent],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [MainToolbarService, SinkFundService, TransactionService]
      }).compileComponents();
    })
  );

  beforeEach(
    inject(
      [SinkFundService],
      (service: SinkFundService, gateway: ApiGateway) => {
        fixture = TestBed.createComponent(SinkFundsComponent);
        component = fixture.componentInstance;

        sinkFundService = service;
        apiGateway = gateway;
      }
    )
  );

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it(
    "gets the current sink fund",
    waitForAsync(() => {
      let response = SampleSinkFundData;
      spyOn(sinkFundService, "refreshSinkFund").and.returnValue(null);
      spyOn(sinkFundService, "getCurrent").and.returnValue(of(response));
      spyOn(sinkFundService, "getSinkFunds").and.returnValue(of([response]));

      fixture.detectChanges();
      expect(component.sinkFund).toEqual(response);
    })
  );
});
