import { HighlightDeletedDirective } from './highlight-deleted.directive';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

@Component({
  template: `
    <div [ecHighlightDeletedFor]="item">Hello</div>
  `
})
class TestComponent {
  item = { text: 'Hello', deleted: false };
}

describe('HighlightDeletedDirective', () => {

  let fixture: ComponentFixture<TestComponent>;
  let testComponent: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
      ],
      declarations: [
        TestComponent, HighlightDeletedDirective
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });

  it('adds a "deleted" class if item is deleted', () => {
    testComponent.item.deleted = true;
    fixture.detectChanges();

    let element = fixture.nativeElement.querySelector('.deleted');
    expect(element).toBeTruthy('deleted class found on element');
  });

  it('does not add a "deleted" class if item is not deleted', () => {
    testComponent.item.deleted = false;
    fixture.detectChanges();

    let element = fixture.nativeElement.querySelector('.deleted');
    expect(element).toBeFalsy('deleted class not found');
  });
});
