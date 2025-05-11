import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialEventsComponent } from './special-events.component';

describe('SpecialEventsComponent', () => {
  let component: SpecialEventsComponent;
  let fixture: ComponentFixture<SpecialEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecialEventsComponent ]
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
