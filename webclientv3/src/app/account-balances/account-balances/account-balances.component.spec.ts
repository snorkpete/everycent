import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { AccountBalancesModule } from "../account-balances.module";
import { AdjustBalancesComponent } from "../adjust-balances/adjust-balances.component";

import { AccountBalancesComponent } from "./account-balances.component";
import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { SharedModule } from "../../shared/shared.module";
import { AccountBalancesService } from "../account-balances.service";
import { ApiGateway } from "../../../api/api-gateway.service";
import { ApiGatewayStub } from "../../../../test/stub-services/api-gateway-stub";
import { TestConfigModule } from "../../../../test/test-config.module";

describe("AccountBalancesComponent", () => {
  let component: AccountBalancesComponent;
  let fixture: ComponentFixture<AccountBalancesComponent>;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule.forRoot(), TestConfigModule, AccountBalancesModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBalancesComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it('has an "Adjust Balances" button', () => {
    let element = de.nativeElement.querySelector("button");
    expect(element).toBeTruthy("adjust-balances button exists");
    expect(element.textContent).toContain("Adjust");
  });

  it('clicking the "Adjust Balances" button triggers the "show Adjust Balances" form', () => {
    let element = de.nativeElement.querySelector("button");

    let spy = spyOn(
      component,
      "showAdjustAccountBalancesForm"
    ).and.callThrough();
    element.click();

    expect(spy.calls.count()).toEqual(
      1,
      "triggers the showAdjustAccountBalances action"
    );
  });

  describe("#showAdjustAccountBalances", () => {
    let adjustBalancesComponent: AdjustBalancesComponent;
    let fakeDialogRef: any;
    let spy: jasmine.Spy;

    beforeEach(() => {
      adjustBalancesComponent = new AdjustBalancesComponent(null, null);
      fakeDialogRef = {
        componentInstance: adjustBalancesComponent,
        close: () => {}
      };
      spy = spyOn(component.dialog, "open").and.returnValue(fakeDialogRef);
    });

    it("triggers a dialog to return an AdjustBalances component", () => {
      component.showAdjustAccountBalancesForm();
      expect(spy).toHaveBeenCalled();
    });

    it("sets up AdjustBalances component's bankAccounts property", () => {
      component.showAdjustAccountBalancesForm();
      expect(adjustBalancesComponent.bankAccounts).toEqual(
        component.bankAccounts
      );
    });

    xit("wires up the AdjustBalances component to pass save events to the AccountBalances service", () => {
      let serviceSpy = spyOn(
        component.accountBalancesService,
        "adjustAccountBalances"
      ).and.returnValue(true);

      // TODO: figure out how to test this
      // let closeDialogSpy = spyOn(component.dialogRef, "close").and.callThrough();
      component.showAdjustAccountBalancesForm();

      adjustBalancesComponent.save.subscribe();

      let testParams = { adjustments: [] };
      // adjustBalancesComponent.save.emit(testParams);
      // expect(serviceSpy).toHaveBeenCalledWith(testParams);

      //TODO: figure out how to test this
      pending("Figure out how to test that the dialog is closed on save");
      // expect(closeDialogSpy).toHaveBeenCalled();
    });
  });
});
