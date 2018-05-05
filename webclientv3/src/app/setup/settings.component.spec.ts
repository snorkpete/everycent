import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {TestConfigModule} from "../../../test/test-config.module";
import {BankAccountService} from "../bank-accounts/bank-account.service";
import {SharedModule} from "../shared/shared.module";

import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
        SharedModule.forRoot(),
      ],
      declarations: [ SettingsComponent ],
      providers: [
        BankAccountService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
