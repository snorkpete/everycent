import {Directive, ElementRef, OnInit} from "@angular/core";
import {} from "@angular/flex-layout"
import {MediaMonitor} from "@angular/flex-layout";
import {MediaChange} from "@angular/flex-layout";
@Directive({
  selector: '[ecHideOnMobile]'
})
export class HideOnMobileDirective implements OnInit{

  private originalDisplayStyle: string;

  constructor(
    private el: ElementRef,
    private mediaMonitor: MediaMonitor
  ){}

  ngOnInit(){
    this.originalDisplayStyle = this.el.nativeElement.style.display;

    this.mediaMonitor.observe('xs').subscribe((mediaChange: MediaChange) => {
      if(mediaChange.matches){
        this.el.nativeElement.style.display = 'none';
      }else{
        this.el.nativeElement.style.display = this.originalDisplayStyle;
      }
    });
  }

}
