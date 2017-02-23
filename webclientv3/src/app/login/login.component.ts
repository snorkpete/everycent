import {Component, OnInit} from '@angular/core';
import {MainToolbarService} from '../shared/main-toolbar/main-toolbar.service';
import {AuthService} from '../shared/auth/auth.service';
import {MessageService} from '../message-display/message.service';

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
                <input md-input placeholder="Email" type="text" name="email" [(ngModel)]="email" class="email"/>
            </md-input-container>
            
            <md-input-container>
                <input md-input placeholder="Password" type="password" name="password" [(ngModel)]="password" class="password"/>
            </md-input-container>
        </md-card-content>
        
        <md-divider></md-divider>
        
        <md-card-actions>
            <button md-raised-button color="primary" type="submit" class="login">Log In</button>
            <button md-raised-button color="" type="reset">Cancel</button>
        </md-card-actions>
    </md-card>
    </form>
  `
})
export class LoginComponent implements OnInit {

  email: string;
  password: string;

  constructor(
    private mainToolbarService: MainToolbarService,
    private authService: AuthService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.mainToolbarService.hideToolbar();
  }

  login(): Promise<any> {
    return this.authService.logIn(this.email, this.password)
                           .catch(error => this.messageService.setErrorMessage(error)) ;
  }

}
