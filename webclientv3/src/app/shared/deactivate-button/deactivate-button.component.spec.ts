import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DeactivateButtonComponent } from './deactivate-button.component';
import {SharedModule} from '../shared.module';
import {EcIconComponent} from '../ec-icon/ec-icon.component';
import {By} from '@angular/platform-browser';
import {Icon} from '../ec-icon/icon.type';
import {EcMaterialModule} from "../ec-material/ec-material.module";

describe('DeactivateButtonComponent', () => {
  let component: DeactivateButtonComponent;
  let fixture: ComponentFixture<DeactivateButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EcMaterialModule],
      declarations: [ DeactivateButtonComponent, EcIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeactivateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when editMode is false', () => {
    let item: any = {};

    it('displays no buttons', () => {
      component.editMode = false;
      fixture.detectChanges();
      let deleteIcon = fixture.nativeElement.querySelector('ec-icon');
      expect(deleteIcon).toBeFalsy();
    });
  });

  describe('when item is not deleted', () => {

    let item: any;

    beforeEach(() => {
      item = { deactivated: false };
      component.item = item;
      component.editMode = true;
      fixture.detectChanges();
    });

    it('shows a delete icon', () => {
      let deactivateIcon = fixture.debugElement.query(By.css('ec-icon'));
      expect(deactivateIcon).toBeTruthy();
      expect(component.icon).toEqual(Icon.DEACTIVATE);
    });

    it('changes the item.deleted property to true when delete button clicked', () => {
      let deleteIcon = fixture.debugElement.query(By.css('ec-icon'));
      deleteIcon.nativeElement.click();
      fixture.detectChanges();

      expect(item.deactivated).toBe(true);
      expect(component.icon).toEqual(Icon.ACTIVATE);
    });
  });

  describe('when item is deleted', () => {

    let item: any;

    beforeEach(() => {
      item = { deactivated: true };
      component.item = item;
      component.editMode = true;
      fixture.detectChanges();
    });

    it('shows an undo-delete icon', () => {
      let deactivateIcon = fixture.debugElement.query(By.css('ec-icon'));
      expect(deactivateIcon).toBeTruthy();
      expect(component.icon).toEqual(Icon.ACTIVATE);
    });

    it('changes the item.deleted property to true when delete button clicked', () => {
      let deleteIcon = fixture.debugElement.query(By.css('ec-icon'));
      deleteIcon.nativeElement.click();
      fixture.detectChanges();

      expect(item.deactivated).toBe(false);
      expect(component.icon).toEqual(Icon.DEACTIVATE);
    });
  });
});
