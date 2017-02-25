import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {Icon} from '../ec-icon/icon.type';

@Component({
  selector: 'ec-menu',
  styles: [`
    md-list-item:hover {
        color: blue;
    }
    md-list-item {
        cursor: pointer;
    }
    
    md-icon {
        margin-right: 10px;
    }
  `],
  template: `
    <md-list>
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
  }

  logOut(): void {
    this.authService.logOut().then(() => {
      this.menuSelect.emit();
      this.router.navigate(['/login']);
    });
  }

}
