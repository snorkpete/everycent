import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { of } from "rxjs";
import { MessageService } from "../message-display/message.service";
import { MainToolbarService } from "../shared/main-toolbar/main-toolbar.service";
import { SetupService } from "./setup.service";
import { SpecialEventsComponent } from "./special-events.component";

describe("SpecialEventsComponent", () => {
  let component: SpecialEventsComponent;
  let fixture: ComponentFixture<SpecialEventsComponent>;
  let setupService: jasmine.SpyObj<SetupService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let toolbar: jasmine.SpyObj<MainToolbarService>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    setupService = jasmine.createSpyObj("SetupService", ["getSpecialEvents"]);
    dialog = jasmine.createSpyObj("MatDialog", ["open"]);
    toolbar = jasmine.createSpyObj("MainToolbarService", [""]);
    messageService = jasmine.createSpyObj("MessageService", ["setMessage"]);

    await TestBed.configureTestingModule({
      declarations: [SpecialEventsComponent],
      providers: [
        { provide: SetupService, useValue: setupService },
        { provide: MatDialog, useValue: dialog },
        { provide: MainToolbarService, useValue: toolbar },
        { provide: MessageService, useValue: messageService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
}); 