import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransferFormComponent } from './add-transfer-form.component';
import {MaterialModule} from '@angular/material';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {ApiGateway} from '../../../api/api-gateway.service';
import {ApiGatewayStub} from '../../../../test/api-gateway-stub';
import {SinkFundService} from '../sink-fund.service';
import {LoginComponent} from '../../login/login.component';

xdescribe('AddTransferFormComponent', () => {
  let component: AddTransferFormComponent;
  let fixture: ComponentFixture<AddTransferFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, SharedModule],
      declarations: [ AddTransferFormComponent, LoginComponent ],
      providers: [
        SinkFundService,
        { provide: ApiGateway, useValue: ApiGatewayStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTransferFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
