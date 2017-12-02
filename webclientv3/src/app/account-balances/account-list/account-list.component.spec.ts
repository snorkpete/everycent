import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountListComponent } from './account-list.component';
import {TestConfigModule} from "../../../../test/test-config.module";
import {EcMaterialModule} from "../../shared/ec-material/ec-material.module";
import {SharedModule} from "../../shared/shared.module";

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
        SharedModule,
      ],
      declarations: [ AccountListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
