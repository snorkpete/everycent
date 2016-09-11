
import {Component, Output, EventEmitter, OnInit} from "@angular/core";
import {AuthService} from "../auth/auth.service";
import {MenuOption} from "../shared/menu-option.model";
import {accountBalancesMenuOptions} from "../account-balances/account-balances.routing";
import {Icons} from '../shared/icons.constants';
import {budgetsMenuOptions} from "../budgets/budgets.routing";

@Component({
  styles:[`
    md-list-item md-icon{
      margin-right: 10px;
    }
  `],
  selector: 'ec-menu',
  template:`
    <h3>EveryCent Menu</h3>
    <md-list>
    
        <md-list-item routerLink="/" 
                      routerLinkActive="selected" 
                      [routerLinkActiveOptions]="exactLinkOption"
        >
          <md-icon>{{Icons.HOME}}</md-icon> Home
        </md-list-item>
        
        <md-list-item *ngFor="let option of menuOptions" 
                      [routerLink]="option.path" 
                      routerLinkActive="selected"
        >
            <md-icon>{{option.icon}}</md-icon> {{option.label}}
        </md-list-item>
        
        <md-divider></md-divider>
        <md-list-item (click)="logout()"><md-icon>{{Icons.LOGOUT}}</md-icon> Log Out</md-list-item>
    </md-list>
    
  `
})
export class MenuComponent implements OnInit{

  exactLinkOption = { exact: true };
  Icons: any;

  @Output() close = new EventEmitter();
  public menuOptions: MenuOption[] = [];

  constructor(
    private authService: AuthService
  ){}

  ngOnInit(): void {
    this.Icons = Icons;
    this.setupMenuOptions();
  }

  logout(){
    this.authService.logout();
    this.close.emit(true);
  }

  private setupMenuOptions() {
    this.menuOptions = []
          .concat(budgetsMenuOptions)
          .concat(accountBalancesMenuOptions)
  }
}
