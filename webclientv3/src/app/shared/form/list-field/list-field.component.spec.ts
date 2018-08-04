import { DebugElement } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { TestConfigModule } from "../../../../../test/test-config.module";

import { ListFieldComponent } from "./list-field.component";

describe("ListFieldComponent", () => {
  let component: ListFieldComponent;
  let fixture: ComponentFixture<ListFieldComponent>;
  let de: DebugElement;
  let sampleItems: any[];
  let selected: number;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [FormsModule, ReactiveFormsModule, TestConfigModule],
        declarations: [ListFieldComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFieldComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  beforeEach(() => {
    sampleItems = [
      { id: 1, name: "First", group_id: 1, group: { id: 1, name: "Group 10" } },
      {
        id: 2,
        name: "Second",
        group_id: 1,
        group: { id: 1, name: "Group 10" }
      },

      {
        id: 3,
        name: "Twenty First",
        group_id: 20,
        group: { id: 20, name: "Group Twenty" }
      },
      {
        id: 4,
        name: "Twenty Second",
        group_id: 20,
        group: { id: 20, name: "Group Twenty" }
      },
      {
        id: 5,
        name: "Twenty Third",
        group_id: 20,
        group: { id: 20, name: "Group Twenty" }
      }
    ];

    selected = 2;
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("when editMode is false", () => {
    it("displays the name of an item if it exists in the item list", () => {
      let selectedItem = sampleItems[3];
      component.items = sampleItems;
      component.editMode = false;
      component.value = selectedItem.id;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toContain(selectedItem.name);
    });

    it("displays the value if the item doesn't exist in the item list", () => {
      component.items = sampleItems;
      component.editMode = false;
      component.value = 2000;
      fixture.detectChanges();
      expect(de.nativeElement.textContent).toContain(2000);
    });
  });

  describe("when editMode is true", () => {
    beforeEach(() => {
      component.editMode = true;
      component.items = sampleItems;
    });

    it("has a select element", () => {
      fixture.detectChanges();
      let select = de.query(By.css("select"));
      expect(select).toBeTruthy();
    });

    it("has x option elements for items of length x plus one blank element first", () => {
      fixture.detectChanges();
      let options = de.queryAll(By.css("option"));
      expect(options.length).toEqual(sampleItems.length + 1);
      expect(options[0].nativeElement.value).toEqual("0");
    });

    describe("without grouping", () => {});

    describe("with grouping", () => {
      beforeEach(() => {
        component.groupBy = "group"; /*? component.groupBy */
      });

      it("has the correct number of option groups", () => {
        fixture.detectChanges(); /*? component.groups */
        let optGroups = de.queryAll(By.css("optgroup"));
        expect(optGroups.length).toEqual(2);
      });
    });
  });
});
