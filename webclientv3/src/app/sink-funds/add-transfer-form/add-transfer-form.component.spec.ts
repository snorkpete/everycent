import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {DeactivateService} from "../../shared/deactivate-button/deactivate.service";

import { AddTransferFormComponent } from './add-transfer-form.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {ApiGateway} from '../../../api/api-gateway.service';
import {ApiGatewayStub} from '../../../../test/stub-services/api-gateway-stub';
import {SinkFundService} from '../sink-fund.service';
import {LoginComponent} from '../../login/login.component';
import {EcMaterialModule} from "../../shared/ec-material/ec-material.module";
import {MatDialogRef} from "@angular/material";
import {SampleSinkFundData} from "../../../../test/samples/sample-sink-fund-data";
import {TestConfigModule} from "../../../../test/test-config.module";

describe('AddTransferFormComponent', () => {
  let component: AddTransferFormComponent;
  let fixture: ComponentFixture<AddTransferFormComponent>;

  const MatDialogRefStub = {
    close: () => {},
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule, SharedModule],
      declarations: [ AddTransferFormComponent, LoginComponent ],
      providers: [
        SinkFundService,
        DeactivateService,
        { provide: ApiGateway, useValue: ApiGatewayStub },
        { provide: MatDialogRef, useValue: MatDialogRefStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTransferFormComponent);
    component = fixture.componentInstance;
    component.sinkFund = SampleSinkFundData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
