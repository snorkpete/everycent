import { Component, OnInit } from "@angular/core";
import { BankAccountData } from "../../../bank-accounts/bank-account.model";
import { BankAccountService } from "../../../bank-accounts/bank-account.service";
import { SinkFundAllocationData } from "../../../sink-funds/sink-fund-allocation-data.model";
import { AllocationData } from "../../allocation-data.model";

@Component({
  selector: "ec-transfer-form",
  template: `
    <p>
      Bank Account Transfer
    </p>
  `,
  styles: []
})
export class TransferFormComponent implements OnInit {
  constructor(private bankAccountService: BankAccountService) {}

  bankAccount: BankAccountData = {};
  bankAccounts: BankAccountData[] = [];
  allocations: AllocationData[] = [];
  sinkFundAllocations: SinkFundAllocationData[] = [];

  ngOnInit() {
    this.bankAccountService
      .getBankAccounts()
      .subscribe(bankAccounts => (this.bankAccounts = bankAccounts));
  }

  selectBankAccount(bankAccount: BankAccountData) {
    this.bankAccount = bankAccount;

    if (bankAccount.is_sink_fund) {
      this.bankAccountService
        .getSinkFundAllocations(bankAccount.id)
        .subscribe(
          sinkFundAllocations =>
            (this.sinkFundAllocations = sinkFundAllocations)
        );
    } else {
      this.sinkFundAllocations = [];
    }
  }
}
