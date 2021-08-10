import { NO_ERRORS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { of } from "rxjs";
import { TestConfigModule } from "../../../../test/test-config.module";
import { BankAccountService } from "../../bank-accounts/bank-account.service";
import { BudgetService } from "../../budgets/budget.service";
import { MainToolbarService } from "../../shared/main-toolbar/main-toolbar.service";
import { SharedModule } from "../../shared/shared.module";
import { TransactionImporterComponent } from "../importers/transaction-importer/transaction-importer.component";
import { TransactionDataService } from "../transaction-data.service";
import { TransactionListComponent } from "../transaction-list/transaction-list.component";
import { TransactionSearchParams } from "../transaction-search-form/transaction-search-params.model";
import { TransactionService } from "../transaction.service";
import { TransactionsModule } from "../transactions.module";
import { TransactionTransferModule } from "../transfer/transaction-transfer.module";

import { TransactionsComponent } from "./transactions.component";

describe("TransactionsComponent", () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule.forRoot(),
        TestConfigModule,
        TransactionsModule,
        TransactionTransferModule
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        TransactionDataService,
        BudgetService,
        BankAccountService,
        TransactionService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("sets up the page heading properly", () => {
    fixture.detectChanges();
    let toolbarService: MainToolbarService = TestBed.inject(MainToolbarService);
    expect(toolbarService.getHeading()).toBe("Transactions");
  });

  it("resets properly after save", () => {
    let transactionService = TestBed.inject(TransactionService);
    spyOn(transactionService, "save").and.returnValue(of([]));
    fixture.detectChanges();
    component.transactionList.isEditMode = true;
    component.save();
    fixture.detectChanges();
    expect(component.transactionList.isEditMode).toBe(false);
  });

  // this doesn't work - the dialog never triggers the subscribe
  xit("shows the dialog", () =>
    async(() => {
      component.transactions = [];
      let dialog = component.showImportForm();

      dialog.close([{ name: "new transaction result" }]);

      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(component.transactions.length).toEqual(2);
      });
    }));

  describe("#showTransferForm", () => {
    it("gets its allocations from the currently selected budget", () => {
      // first run of change detection to ensure ngInit fires
      fixture.detectChanges();

      component.budget = { allocations: [{ id: 2, name: "Test" }] };
      let dialog = component.showTransferForm();
      const transferFormComponent = dialog.componentInstance;
      fixture.detectChanges();

      expect(transferFormComponent.allocations).toEqual(
        component.budget.allocations
      );

      // fixture.whenStable().then(() => {
      // });
    });
  });
});
