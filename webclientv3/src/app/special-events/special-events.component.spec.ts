import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';
import { TestConfigModule } from '../../../test/test-config.module';
import { MessageService } from '../message-display/message.service';
import { LoadingIndicator } from '../shared/loading-indicator/loading-indicator.service';
import { SpecialEventsService } from './special-events.service';

import { SpecialEventsComponent } from './special-events.component';

describe('SpecialEventsComponent', () => {
  let component: SpecialEventsComponent;
  let fixture: ComponentFixture<SpecialEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TestConfigModule, MatDialogModule ],
      declarations: [ SpecialEventsComponent ],
      providers: [
        { provide: MessageService, useValue: { setMessage: () => undefined } },
        LoadingIndicator,
        { provide: SpecialEventsService, useValue: { getSpecialEvents: () => of([]) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
