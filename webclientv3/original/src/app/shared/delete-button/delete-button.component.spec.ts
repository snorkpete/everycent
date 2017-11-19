import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteButtonComponent } from './delete-button.component';
import {SharedModule} from '../shared.module';
import {EcIconComponent} from '../ec-icon/ec-icon.component';
import {MaterialModule} from '@angular/material';
import {By} from '@angular/platform-browser';
import {Icon} from '../ec-icon/icon.type';

describe('DeleteButtonComponent', () => {
  let component: DeleteButtonComponent;
  let fixture: ComponentFixture<DeleteButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [ DeleteButtonComponent, EcIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteButtonComponent);
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
      item = { deleted: false };
      component.item = item;
      component.editMode = true;
      fixture.detectChanges();
    });

    it('shows a delete icon', () => {
      let deleteIcon = fixture.debugElement.query(By.css('ec-icon'));
      expect(deleteIcon).toBeTruthy();
      expect(component.icon).toEqual(Icon.DELETE);
    });

    it('changes the item.deleted property to true when delete button clicked', () => {
      let deleteIcon = fixture.debugElement.query(By.css('ec-icon'));
      deleteIcon.nativeElement.click();
      fixture.detectChanges();

      expect(item.deleted).toBe(true);
      expect(component.icon).toEqual(Icon.UNDO_DELETE);
    });
  });

  describe('when item is deleted', () => {

    let item: any;

    beforeEach(() => {
      item = { deleted: true };
      component.item = item;
      component.editMode = true;
      fixture.detectChanges();
    });

    it('shows an undo-delete icon', () => {
      let deleteIcon = fixture.debugElement.query(By.css('ec-icon'));
      expect(deleteIcon).toBeTruthy();
      expect(component.icon).toEqual(Icon.UNDO_DELETE);
    });

    it('changes the item.deleted property to true when delete button clicked', () => {
      let deleteIcon = fixture.debugElement.query(By.css('ec-icon'));
      deleteIcon.nativeElement.click();
      fixture.detectChanges();

      expect(item.deleted).toBe(false);
      expect(component.icon).toEqual(Icon.DELETE);
    });
  });
});
