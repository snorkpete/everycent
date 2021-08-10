import { OverlayContainer, OverlayModule } from "@angular/cdk/overlay";
import { DebugElement } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { TestConfigModule } from "../../../../../test/test-config.module";
import { SharedModule } from "../../../shared/shared.module";
import { TransactionData } from "../../transaction-data.model";
import { FcbImporterService } from "../fcb-importer.service";
import {
  TRANSACTION_IMPORTER_PROVIDERS,
  TransactionImporterModule
} from "../transaction-importer.module";
import { TransactionImporterService } from "../transaction-importer.service";

import { TransactionImporterComponent } from "./transaction-importer.component";

xdescribe("TransactionImporterComponent", () => {
  let component: TransactionImporterComponent;
  let fixture: ComponentFixture<TransactionImporterComponent>;
  let de: DebugElement;
  let oc: OverlayContainer;
  let ocEl: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
        SharedModule,
        TransactionImporterModule,
        { provide: TransactionImporterService, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionImporterComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("contains a text area", () => {
    let textArea = de.nativeElement.querySelector("textarea");
    expect(textArea).toBeTruthy();
  });

  it("contains an import and a cancel button", () => {
    let buttons = de.nativeElement.querySelectorAll("button");
    expect(buttons.length).toEqual(2);
    expect(buttons[0].textContent).toContain("Import");
    expect(buttons[1].textContent).toContain("Cancel");
  });

  it("clicking the import button triggers an import event", () => {
    let importBtn = de.nativeElement.querySelector("button");
    let importEvents = 0;
    let sub = component.import.subscribe(() => {
      importEvents++;
    });
    importBtn.click();
    fixture.detectChanges();
    expect(importEvents).toEqual(1);
    sub.unsubscribe();
  });

  it("clicking the import button causes import function to be triggered", () => {
    let sampleInput = "Hello world";
    let sampleTransactions: TransactionData[] = [
      { id: 1, description: "First" },
      { id: 2, description: "Second" }
    ];
    let importerService: TransactionImporterService = TestBed.inject(
      TransactionImporterService
    );
    let spy = spyOn(importerService, "convertToTransactions").and.returnValue(
      sampleTransactions
    );

    let sub = component.import.subscribe(value => {
      expect(value).toEqual(sampleTransactions);
    });

    component.input = sampleInput;
    component.startDate = "2017-12-01";
    component.endDate = "2017-12-01";
    component.importType = "abn-amro-bank";

    let importBtn = de.nativeElement.querySelector("button");
    importBtn.click();
    fixture.detectChanges();

    expect(spy.calls.count()).toEqual(1);
    let args = spy.calls.mostRecent().args;

    expect(args[0]).toEqual(sampleInput);
    expect(args[1]).toEqual(component.startDate);
    expect(args[2]).toEqual(component.endDate);
    expect(args[3]).toEqual(component.importType);

    sub.unsubscribe();
  });

  it("clicking the cancel button triggers a cancel event", () => {
    let cancelBtn = de.nativeElement.querySelectorAll("button")[1];
    let cancelEvents = 0;
    // let sub = component.cancel.subscribe(() => {
    //   cancelEvents++;
    // });
    cancelBtn.click();
    fixture.detectChanges();
    expect(cancelEvents).toEqual(1);
    // sub.unsubscribe();
  });

  xit("contains a bank import type selector", () => {
    let select = de.nativeElement.querySelector("mat-select");
    expect(select).toBeTruthy();

    let options = de.nativeElement.querySelectorAll("mat-option");
    expect(de.nativeElement.innerHTML).toEqual(5);
    expect(options.length).toEqual(5);
    expect(options[0].textContent).toContain("ABN Amro Bank Account");
    expect(options[1].textContent).toContain(
      "ABN Amro Credit Card (not implemented)"
    );
    expect(options[2].textContent).toContain("Scotia Bank Account");
    expect(options[3].textContent).toContain("FCB Bank Account");
    expect(options[4].textContent).toContain(
      "FCB Credit Card (not implemented)"
    );

    expect(options[0].value).toContain("abn-amro-bank");
    expect(options[1].value).toContain("abn-amro-creditcard");
    expect(options[2].value).toContain("new-bank-account");
    expect(options[3].value).toContain("fc-bank");
    expect(options[4].value).toContain("fc-creditcard");
  });
});
