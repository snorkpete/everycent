import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs/internal/observable/of";
import { TestConfigModule } from "../../../../test/test-config.module";
import { BankAccountService } from "../../bank-accounts/bank-account.service";
import { SharedModule } from "../../shared/shared.module";
import { TransactionsModule } from "../transactions.module";
import { TransactionTransferModule } from "./transaction-transfer.module";

import { AccountTransferFormComponent } from "./account-transfer-form.component";

describe("TransferFormComponent", () => {
  let component: AccountTransferFormComponent;
  let fixture: ComponentFixture<AccountTransferFormComponent>;

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
    fixture = TestBed.createComponent(AccountTransferFormComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("gets its bankAccounts", async(() => {
    const sampleBankAccounts = [{ id: 100, name: "First Bank" }];
    const bankAccountService = TestBed.inject(BankAccountService);
    const spy = spyOn(
      bankAccountService,
      "getBankAccountsWithBalances"
    ).and.returnValue(of(sampleBankAccounts));
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(spy.calls.count()).toBe(1);
      expect(component.bankAccounts).toEqual(sampleBankAccounts);
    });
  }));

  describe("#selectBankAccount", () => {
    const sampleBankAccounts = [
      { id: 100, name: "First Bank Account" },
      { id: 200, name: "Sink Fund Account", is_sink_fund: true },
      { id: 300, name: "Third Account" }
    ];

    beforeEach(() => {
      const bankAccountService = TestBed.inject(BankAccountService);
      const spy = spyOn(
        bankAccountService,
        "getBankAccountsWithBalances"
      ).and.returnValue(of(sampleBankAccounts));
    });

    it("updates the selected bank account", async(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        component.accountTransfer.from = sampleBankAccounts[0].id;
        component.selectFromBankAccount();
        expect(component.fromAccount).toEqual(sampleBankAccounts[0]);
      });
    }));

    it("updates the list of sink funds if the account is a sink fund", async(() => {
      const bankAccountService = TestBed.inject(BankAccountService);
      const sampleSinkFundAllocations = [
        { id: 1, name: "Savings" },
        { id: 2, name: "Future Debt" }
      ];
      const spy = spyOn(
        bankAccountService,
        "getSinkFundAllocations"
      ).and.returnValue(of(sampleSinkFundAllocations));

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        component.accountTransfer.from = sampleBankAccounts[1].id;
        component.selectFromBankAccount();

        expect(spy.calls.count()).toBe(1);
        expect(spy.calls.mostRecent().args[0]).toEqual(200);
        expect(component.sinkFundAllocationsFrom).toEqual(
          sampleSinkFundAllocations
        );
      });
    }));

    it("clears list of sink funds if the account is NOT a sink fund", async(() => {
      const bankAccountService = TestBed.inject(BankAccountService);
      const sampleSinkFundAllocations = [
        { id: 1, name: "Savings" },
        { id: 2, name: "Future Debt" }
      ];
      component.sinkFundAllocationsFrom = sampleSinkFundAllocations;
      const spy = spyOn(
        bankAccountService,
        "getSinkFundAllocations"
      ).and.returnValue(of(sampleSinkFundAllocations));

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        component.accountTransfer.from = sampleBankAccounts[2].id;
        component.selectFromBankAccount();
        expect(spy.calls.count()).toBe(0);
        expect(component.sinkFundAllocationsFrom).toEqual([]);
      });
    }));
  });
});
