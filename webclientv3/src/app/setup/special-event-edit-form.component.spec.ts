import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { SpecialEventEditFormComponent } from "./special-event-edit-form.component";

describe("SpecialEventEditFormComponent", () => {
  let component: SpecialEventEditFormComponent;
  let fixture: ComponentFixture<SpecialEventEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpecialEventEditFormComponent],
      imports: [ReactiveFormsModule, MatDialogModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialEventEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
}); 