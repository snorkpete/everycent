import {Injectable} from "@angular/core";
import {Router, NavigationEnd} from "@angular/router";
import {Observable, BehaviorSubject} from "rxjs";
@Injectable()
export class MenuDisplayService{
  private heading$ = new BehaviorSubject<string>('');
  constructor(
    private router: Router
  ){}

  /** Returns a boolean observable that indicates, for each route,
   *  if the menu should be displayed or not
   */
  isMenuVisible$(): Observable<boolean>{
    let isMenuCurrentlyVisible = !this.router.isActive('login', false);
    return this.router.events
          .filter(e => e instanceof NavigationEnd)
          .map(() => !this.router.isActive('login', false))
          .startWith(isMenuCurrentlyVisible)
      ;
  }

  setHeading(heading: string){
    this.heading$.next(heading);
  }

  getHeading$(){
    return this.heading$;
  }
}
