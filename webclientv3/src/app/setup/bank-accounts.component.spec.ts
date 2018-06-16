import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { TestConfigModule } from "../../../test/test-config.module";
import { SharedModule } from "../shared/shared.module";

import { BankAccountsComponent } from "./bank-accounts.component";

describe("BankAccountsComponent", () => {
  let component: BankAccountsComponent;
  let fixture: ComponentFixture<BankAccountsComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule, SharedModule.forRoot()],
        declarations: [BankAccountsComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
