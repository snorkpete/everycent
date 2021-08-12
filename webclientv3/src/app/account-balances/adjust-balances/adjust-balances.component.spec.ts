import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { TestConfigModule } from "../../../../test/test-config.module";
import { SharedModule } from "../../shared/shared.module";

import { AdjustBalancesComponent } from "./adjust-balances.component";

describe("AdjustBalancesComponent", () => {
  let component: AdjustBalancesComponent;
  let fixture: ComponentFixture<AdjustBalancesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule.forRoot(), TestConfigModule],
      declarations: [AdjustBalancesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustBalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
