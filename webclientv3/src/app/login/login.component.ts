import { Component, OnInit } from '@angular/core';
import {MainToolbarService} from '../shared/main-toolbar/main-toolbar.service';

@Component({
  selector: 'ec-login',
  styles: [`
    md-card {
        width: 350px;
        margin: auto;
    }
    md-card-actions {
        margin: 0;
    }
    md-toolbar{
        margin-bottom: 15px;
    }
  `],
  template: `
    <form (ngSubmit)="login()">
    <md-card>
        <md-card-title color=""><md-icon>lock </md-icon> EveryCent - Log In</md-card-title>
        
        <md-divider></md-divider>
        
        <md-card-content fxLayout="column">
            <md-input-container>
                <input md-input placeholder="Email" type="text" />
            </md-input-container>
            
            <md-input-container>
                <input md-input placeholder="Password" type="password" />
            </md-input-container>
        </md-card-content>
        
        <md-divider></md-divider>
        
        <md-card-actions>
            <button md-raised-button color="primary" type="submit">Log In</button>
            <button md-raised-button color="" type="reset">Cancel</button>
        </md-card-actions>
    </md-card>
    </form>
  `
})
export class LoginComponent implements OnInit {

  constructor(
    private mainToolbarService: MainToolbarService
  ) { }

  ngOnInit() {
    this.mainToolbarService.hideToolbar();
  }

  login() {

  }

}
