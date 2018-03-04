import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TestConfigModule} from "../../../../test/test-config.module";
import {SharedTransactionService} from "../../shared-transactions/shared-transaction.service";
import {SharedModule} from '../../shared/shared.module';
import {SinkFundService} from '../sink-fund.service';

import {SinkFundComponent} from './sink-fund.component';

describe('SinkFundComponent', () => {
  let component: SinkFundComponent;
  let fixture: ComponentFixture<SinkFundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule, SharedModule.forRoot()],
      declarations: [ SinkFundComponent ],
      providers: [
        SharedTransactionService,
        SinkFundService,
      ],
    })
    .compileComponents();
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SinkFundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to "non-edit-mode"', () => {
    expect(component.isEditMode).toBeFalsy('non-edit-mode by default');
  });

});
