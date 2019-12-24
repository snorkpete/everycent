import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs/internal/observable/of";
import { TestConfigModule } from "../../../../../test/test-config.module";
import { BankAccountService } from "../../../bank-accounts/bank-account.service";
import { SharedModule } from "../../../shared/shared.module";
import { TransactionsModule } from "../../transactions.module";
import { TransactionTransferModule } from "../transaction-transfer.module";

import { TransferFormComponent } from "./transfer-form.component";

describe("TransferFormComponent", () => {
  let component: TransferFormComponent;
  let fixture: ComponentFixture<TransferFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule.forRoot(),
        TestConfigModule,
        TransactionTransferModule
      ],
      providers: [BankAccountService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferFormComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("gets its bankAccounts", () => {
    const sampleBankAccounts = [{ name: "First Bank" }];
    const bankAccountService = TestBed.get(BankAccountService);
    const spy = spyOn(bankAccountService, "getBankAccounts").and.returnValue(
      of(sampleBankAccounts)
    );
    fixture.detectChanges();

    expect(spy.calls.count()).toBe(1);
    expect(component.bankAccounts).toEqual(sampleBankAccounts);
  });

  describe("#selectBankAccount", () => {
    it("updates the selected bank account", () => {
      component.selectBankAccount({ name: "Random Account" });
      expect(component.bankAccount).toEqual({ name: "Random Account" });
    });

    it("updates the list of sink funds if the account is a sink fund", () => {
      const bankAccountService = TestBed.get(BankAccountService);
      const sampleSinkFundAllocations = [
        { id: 1, name: "Savings" },
        { id: 2, name: "Future Debt" }
      ];
      const spy = spyOn(
        bankAccountService,
        "getSinkFundAllocations"
      ).and.returnValue(of(sampleSinkFundAllocations));

      component.selectBankAccount({
        id: 100,
        name: "Random Account",
        is_sink_fund: true
      });
      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.mostRecent().args[0]).toEqual(100);
      expect(component.sinkFundAllocations).toEqual(sampleSinkFundAllocations);
    });

    it("clears list of sink funds if the account is NOT a sink fund", () => {
      const bankAccountService = TestBed.get(BankAccountService);
      const sampleSinkFundAllocations = [
        { id: 1, name: "Savings" },
        { id: 2, name: "Future Debt" }
      ];
      component.sinkFundAllocations = sampleSinkFundAllocations;
      const spy = spyOn(
        bankAccountService,
        "getSinkFundAllocations"
      ).and.returnValue(of(sampleSinkFundAllocations));

      component.selectBankAccount({
        id: 100,
        name: "Random Account",
        is_sink_fund: false
      });
      expect(spy.calls.count()).toBe(0);
      expect(component.sinkFundAllocations).toEqual([]);
    });
  });
});
