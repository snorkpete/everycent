import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {Icon} from '../ec-icon/icon.type';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'ec-menu',
  styles: [`
  `],
  template: `
    <md-list>

        <md-divider></md-divider>
        <md-list-item>
            <ec-icon [icon]="Icon.HOME"></ec-icon>
            <a href="/">Go to Old Version </a>
        </md-list-item>
        <md-divider></md-divider>
        
        <ec-menu-item [icon]="Icon.HOME" route="/">
            Home
        </ec-menu-item>

        <ec-menu-item [icon]="Icon.MENU" route="/sink-funds">
            Sink Funds
        </ec-menu-item>
        
        <md-divider></md-divider>
        <md-list-item (click)="logOut()">
            <ec-icon [icon]="Icon.LOGOUT"></ec-icon> Log out
        </md-list-item>
        <md-divider></md-divider>
    </md-list>
  `,
})
export class MenuComponent implements OnInit {

  Icon = Icon;

  @Output()
  menuSelect = new EventEmitter();

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.router.events
        .filter(e => e instanceof NavigationEnd)
        .subscribe(e => this.menuSelect.emit());
  }

  logOut(): void {
    this.authService.logOut().then(() => {
      this.menuSelect.emit();
      this.router.navigate(['/login']);
    });
  }

}
