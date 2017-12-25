import { DebugElement } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import {TestConfigModule} from "../../../../test/test-config.module";
import {EcMaterialModule} from "../../shared/ec-material/ec-material.module";
import { SinkFundData } from "../sink-fund-data.model";

import { SinkFundSelectorComponent } from "./sink-fund-selector.component";

describe("SinkFundSelectorComponent", () => {
  let component: SinkFundSelectorComponent;
  let fixture: ComponentFixture<SinkFundSelectorComponent>;
  let de: DebugElement;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [
          TestConfigModule,
          EcMaterialModule,
        ],
        declarations: [SinkFundSelectorComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SinkFundSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    de = fixture.debugElement;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("the UI", () => {
    let sinkFunds: SinkFundData[] = [
      { id: 1, name: "Sink Fund" },
      { id: 2, name: "Emergency Fund" }
    ];

    beforeEach(() => {
      component.sinkFunds = sinkFunds;
      fixture.detectChanges();
    });

    xit("has a select element", () => {
      let selectEl = de.nativeElement.querySelector("mat-select");
      expect(selectEl).toBeTruthy();
    });

    xit("has option elements for each sinkFund", () => {
      fixture.detectChanges();
      let de = fixture.debugElement;
      let options = de.nativeElement.querySelectorAll("mat-option");
      expect(options.length).toEqual(sinkFunds.length);/*? options */
      expect(options.length).toEqual(sinkFunds.length);/*? options */

      expect(options[0].componentInstance.value).toEqual(sinkFunds[0].id);
      expect(options[1].componentInstance.value).toEqual(sinkFunds[1].id);
    });
  });
});
