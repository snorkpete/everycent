import {Injectable} from "@angular/core";
import {Router, NavigationEnd} from "@angular/router";
import {Observable} from "rxjs";
@Injectable()
export class MenuDisplayService{
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
}
